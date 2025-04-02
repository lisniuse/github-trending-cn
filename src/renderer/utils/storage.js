import path from 'path';
import fs from 'fs';

const STORAGE_DIR = path.join(process.env.USERPROFILE, 'Documents', 'GithubTrending');
const STORAGE_FILE = path.join(STORAGE_DIR, 'history.json');

// 确保存储目录存在
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// 确保存储文件存在
if (!fs.existsSync(STORAGE_FILE)) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify({ repositories: [] }));
}

export const saveRepositories = (repositories) => {
  try {
    const existingData = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    const newRepos = repositories.filter(repo => {
      return !existingData.repositories.some(
        existing => existing.repoUrl === repo.repoUrl
      );
    });
    
    existingData.repositories = [...existingData.repositories, ...newRepos];
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error('保存仓库历史记录失败:', error);
  }
};

export const getStoredRepositories = () => {
  try {
    const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    return data.repositories || [];
  } catch (error) {
    console.error('读取仓库历史记录失败:', error);
    return [];
  }
};