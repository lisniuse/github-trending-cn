const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

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

/**
 * 清空指定周期的仓库数据
 * @param {string} period - 时间周期：'daily', 'weekly', 'monthly'
 * @returns {Promise<boolean>} 是否成功清空
 */
async function clearRepositories(period) {
  try {
    await ensureDataDirectory();
    const dataPath = getDataPath();
    const filePath = path.join(dataPath, `${period}.json`);
    
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      // 文件不存在，视为已清空
      return true;
    }
    
    // 写入空数据
    await fs.writeFile(
      filePath,
      JSON.stringify({
        repositories: [],
        lastUpdated: null
      }, null, 2)
    );
    
    return true;
  } catch (error) {
    console.error(`清空 ${period} 数据失败:`, error);
    return false;
  }
}

/**
 * 清空所有仓库数据
 * @returns {Promise<boolean>} 是否成功清空
 */
async function clearAllRepositories() {
  try {
    const periods = ['daily', 'weekly', 'monthly'];
    const results = await Promise.all(periods.map(period => clearRepositories(period)));
    return results.every(result => result === true);
  } catch (error) {
    console.error('清空所有数据失败:', error);
    return false;
  }
}

module.exports = {
  saveRepositories,
  getRepositories,
  needsUpdate,
  clearRepositories,
  clearAllRepositories
};