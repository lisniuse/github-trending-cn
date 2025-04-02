const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // 数据相关
  invoke: (channel, ...args) => {
    const validChannels = [
        'get-trending-data',
        'get-api-key',
        'set-api-key',
        'get-update-interval',
        'set-update-interval',
        'get-language',
        'set-language',
        'get-proxy-url',
        'set-proxy-url',
        'clear-repositories'  // 添加清空数据的通道
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`不允许调用 ${channel}`));
  },
  
  // 打开外部链接
  openExternal: async (url) => {
    return await ipcRenderer.invoke('open-external', url);
  },

  saveToHistory: (repositories) => {
    return ipcRenderer.invoke('save-to-history', repositories);
  },

  clearHistory: () => {
    return ipcRenderer.invoke('clear-history');
  },

  getHistoryData: () => {
    return ipcRenderer.invoke('get-history-data');
  }
});

