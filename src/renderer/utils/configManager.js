const Store = require('electron-store');
const { dialog } = require('@electron/remote');

// 创建配置存储实例
const store = new Store({
  name: 'github-trending-config',
  defaults: {
    apiKey: '',
    updateInterval: 6, // 默认6小时更新一次
    language: 'zh' // 默认语言
  }
});

/**
 * 获取OpenRouter API密钥
 * @returns {Promise<string>} API密钥
 */
async function getApiKey() {
  const apiKey = store.get('apiKey');
  
  if (!apiKey) {
    // 如果未设置API密钥，提示用户
    await dialog.showMessageBox({
      type: 'warning',
      title: '未配置API密钥',
      message: '请在设置中配置OpenRouter API密钥以启用翻译功能。',
      buttons: ['确定']
    });
  }
  
  return apiKey;
}

/**
 * 设置OpenRouter API密钥
 * @param {string} apiKey - API密钥
 */
function setApiKey(apiKey) {
  store.set('apiKey', apiKey);
}

/**
 * 获取更新间隔（小时）
 * @returns {number} 更新间隔
 */
function getUpdateInterval() {
  return store.get('updateInterval');
}

/**
 * 设置更新间隔（小时）
 * @param {number} hours - 更新间隔
 */
function setUpdateInterval(hours) {
  store.set('updateInterval', hours);
}

/**
 * 获取界面语言
 * @returns {string} 语言代码
 */
function getLanguage() {
  return store.get('language');
}

/**
 * 设置界面语言
 * @param {string} lang - 语言代码
 */
function setLanguage(lang) {
  store.set('language', lang);
}

module.exports = {
  getApiKey,
  setApiKey,
  getUpdateInterval,
  setUpdateInterval,
  getLanguage,
  setLanguage
};