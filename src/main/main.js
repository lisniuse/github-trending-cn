const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { enable } = require('@electron/remote/main');
const parseGitignore = require('parse-gitignore');
const { scrapeGithubTrending } = require('./utils/githubScraper');
const { translateRepositories } = require('./utils/translator');
const {
    saveRepositories,
    getRepositories,
    needsUpdate,
    clearRepositories,
    clearAllRepositories
} = require('./utils/dataStore');

// 定义历史记录文件路径
const HISTORY_FILE = path.join(process.env.USERPROFILE, 'Documents', 'GithubTrending', 'history.json');

let store;
(async () => {
    const { default: Store } = await import('electron-store');
    store = new Store();
})();

// 只在开发环境中加载 electron-reload
if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../../node_modules', 'electron')
    });
}

// 确保目录存在
async function ensureDirectoryExists() {
    const dir = path.dirname(HISTORY_FILE);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemote: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false  // 开发模式下禁用 webSecurity
        }
    });

    // 只在生产环境启用 CSP
    if (process.env.NODE_ENV !== 'development') {
        win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:;" +
                        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
                        "font-src 'self' data: https://fonts.gstatic.com;" +
                        "img-src 'self' data: https:;"
                    ]
                }
            });
        });
    }

    win.removeMenu();
    enable(win.webContents);

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000/');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../../build/index.html'));
    }
}

app.whenReady().then(createWindow);

// 保存到历史记录
ipcMain.handle('save-to-history', async (event, newRepos) => {
    try {
        await ensureDirectoryExists();

        let history = { repositories: [] };
        try {
            const data = await fs.readFile(HISTORY_FILE, 'utf8');
            history = JSON.parse(data);
        } catch (error) {
            // 如果文件不存在或解析失败，使用空数组
        }

        // 过滤掉重复的仓库
        const newHistory = {
            repositories: [
                ...history.repositories,
                ...newRepos.filter(newRepo =>
                    !history.repositories.some(
                        existingRepo => existingRepo.repoUrl === newRepo.repoUrl
                    )
                )
            ]
        };

        await fs.writeFile(HISTORY_FILE, JSON.stringify(newHistory, null, 2));
        return true;
    } catch (error) {
        console.error('保存历史记录失败:', error);
        return false;
    }
});

// 获取历史记录
ipcMain.handle('get-history-data', async () => {
    try {
        await ensureDirectoryExists();
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        const history = JSON.parse(data);
        return history.repositories || [];
    } catch (error) {
        console.error('读取历史记录失败:', error);
        return [];
    }
});

// 添加 IPC 处理器
ipcMain.handle('get-trending-data', async (event, period, forceUpdate = false) => {
    try {
        // 检查是否需要更新数据
        const shouldUpdate = forceUpdate || await needsUpdate(period, store.get('updateInterval', 6));

        if (shouldUpdate) {
            // 获取代理URL
            const proxyUrl = store.get('proxyUrl', '');

            // 爬取最新数据
            const repositories = await scrapeGithubTrending(period, proxyUrl);

            // 获取API密钥
            const apiKey = store.get('apiKey');
            if (!apiKey) {
                return repositories; // 如果没有API密钥，返回未翻译的数据
            }

            // 翻译数据，同时传入代理URL
            const translatedRepos = await translateRepositories(repositories, apiKey, proxyUrl);

            // 保存到本地
            await saveRepositories(translatedRepos, period);

            return translatedRepos;
        } else {
            // 使用本地缓存数据
            const { repositories } = await getRepositories(period);
            return repositories;
        }
    } catch (error) {
        console.error('获取Trending数据失败:', error);

        // 出错时尝试返回本地缓存数据
        try {
            const { repositories } = await getRepositories(period);
            return repositories;
        } catch (e) {
            return [];
        }
    }
});

ipcMain.handle('clear-history', async () => {
    try {
        await fs.writeFile(HISTORY_FILE, JSON.stringify({ repositories: [] }, null, 2));
        return true;
    } catch (error) {
        console.error('清空历史记录失败:', error);
        return false;
    }
});

// 添加设置相关的 IPC 处理器
ipcMain.handle('get-api-key', () => {
    return store.get('apiKey', '');
});

ipcMain.handle('set-api-key', (event, apiKey) => {
    store.set('apiKey', apiKey);
    return true;
});

ipcMain.handle('get-update-interval', () => {
    return store.get('updateInterval', 6);
});

ipcMain.handle('set-update-interval', (event, hours) => {
    store.set('updateInterval', hours);
    return true;
});

// 添加打开外部链接的处理器
ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
    return true;
});

// 添加新的 IPC 处理函数
// 修改语言相关的 IPC 处理器
ipcMain.handle('set-language', async (event, lang) => {
    if (!store) {
        throw new Error('Store not initialized');
    }
    store.set('language', lang);
    return true;
});

ipcMain.handle('open-folder', async (event, filePath) => {
    try {
        await shell.showItemInFolder(filePath);
        return true;
    } catch (error) {
        console.error('Error opening folder:', error);
        return false;
    }
});

// 添加获取系统语言的处理器
ipcMain.handle('get-system-language', () => {
    const locale = app.getLocale();
    return locale.startsWith('zh') ? 'zh' : 'en';
});

ipcMain.handle('get-language', async () => {
    if (!store) {
        const locale = app.getLocale().toLowerCase();
        return locale.startsWith('zh') ? 'zh' : 'en';
    }
    const savedLang = store.get('language');
    if (!savedLang) {
        const locale = app.getLocale().toLowerCase();
        return locale.startsWith('zh') ? 'zh' : 'en';
    }
    return savedLang;
});

// 添加代理相关的 IPC 处理器
ipcMain.handle('get-proxy-url', () => {
    return store.get('proxyUrl', '');
});

ipcMain.handle('set-proxy-url', (event, proxyUrl) => {
    store.set('proxyUrl', proxyUrl);
    return true;
});

// 添加清空数据的 IPC 处理器
ipcMain.handle('clear-repositories', async (event, period) => {
    try {
        if (period === 'all') {
            return await clearAllRepositories();
        } else {
            return await clearRepositories(period);
        }
    } catch (error) {
        console.error('清空数据失败:', error);
        return false;
    }
});