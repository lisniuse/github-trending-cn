const fs = require('fs').promises;
const path = require('path');
const { app } = require('@electron/remote');

// 数据存储路径
const getDataPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'github-trending-data');
};

/**
 * 确保数据目录存在
 */
async function ensureDataDirectory() {
  const dataPath = getDataPath();
  try {
    await fs.mkdir(dataPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * 保存仓库数据到本地
 * @param {Array} repositories - 仓库数据数组
 * @param {string} period - 时间周期：'daily', 'weekly', 'monthly'
 */
async function saveRepositories(repositories, period) {
  await ensureDataDirectory();
  const dataPath = getDataPath();
  const filePath = path.join(dataPath, `${period}.json`);
  
  await fs.writeFile(
    filePath,
    JSON.stringify({
      repositories,
      lastUpdated: new Date().toISOString()
    }, null, 2)
  );
}

/**
 * 从本地获取仓库数据
 * @param {string} period - 时间周期：'daily', 'weekly', 'monthly'
 * @returns {Promise<Object>} 包含仓库数据和最后更新时间的对象
 */
async function getRepositories(period) {
  await ensureDataDirectory();
  const dataPath = getDataPath();
  const filePath = path.join(dataPath, `${period}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在，返回空数据
      return { repositories: [], lastUpdated: null };
    }
    throw error;
  }
}

/**
 * 检查是否需要更新数据
 * @param {string} period - 时间周期：'daily', 'weekly', 'monthly'
 * @param {number} maxAgeHours - 数据最大有效时间（小时）
 * @returns {Promise<boolean>} 是否需要更新
 */
async function needsUpdate(period, maxAgeHours = 6) {
  try {
    const { lastUpdated } = await getRepositories(period);
    
    if (!lastUpdated) {
      return true;
    }
    
    const lastUpdateTime = new Date(lastUpdated).getTime();
    const currentTime = new Date().getTime();
    const hoursDiff = (currentTime - lastUpdateTime) / (1000 * 60 * 60);
    
    return hoursDiff > maxAgeHours;
  } catch (error) {
    return true; // 出错时默认需要更新
  }
}

module.exports = {
  saveRepositories,
  getRepositories,
  needsUpdate
};