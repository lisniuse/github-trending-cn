import React, { useState, useEffect } from 'react';
import { Tabs, Button, Message, Space } from '@arco-design/web-react';
import { IconRefresh, IconSettings, IconDelete, IconHistory } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';
import RepositoryList from './RepositoryList';
import SettingsModal from './SettingsModal';

const TabPane = Tabs.TabPane;
const electron = window.electron;

const TrendingApp = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('daily');
  const [repositories, setRepositories] = useState([]);
  const [historyRepos, setHistoryRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // 加载仓库数据
  const loadRepositories = async (period = activeTab, forceUpdate = false) => {
    try {
      setLoading(true);
      const data = await electron.invoke('get-trending-data', period, forceUpdate);
      setRepositories(data);
      // 只在强制刷新时保存到历史记录
      if (forceUpdate && data && data.length > 0) {
        await electron.saveToHistory(data);
      }
    } catch (error) {
      Message.error(`${t('errors.loadFailed')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 加载历史记录
  const loadHistoryData = async () => {
    try {
      setLoading(true);
      const data = await electron.getHistoryData();
      setHistoryRepos(data || []);
    } catch (error) {
      Message.error(`加载历史记录失败: ${error.message}`);
      setHistoryRepos([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载和标签切换时加载数据
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryData();
    } else {
      loadRepositories(activeTab);
    }
  }, [activeTab]);
  
  // 处理标签切换
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // 处理刷新按钮点击
  const handleRefresh = async () => {
    await loadRepositories(activeTab, true);
  };
  
  const handleClearData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'history') {
        const success = await electron.invoke('clear-history');
        if (success) {
          Message.success('历史记录已清空');
          setHistoryRepos([]);
        } else {
          Message.error('清空历史记录失败');
        }
      } else {
        const success = await electron.invoke('clear-repositories', activeTab);
        if (success) {
          Message.success('数据已清空');
          setRepositories([]);
        } else {
          Message.error('清空数据失败');
        }
      }
    } catch (error) {
      Message.error(`清空数据失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="trending-app">
      <Tabs 
        activeTab={activeTab} 
        onChange={setActiveTab}
        extra={
          <Space>
            <Button 
              type="secondary"
              icon={<IconDelete />}
              onClick={handleClearData}
              loading={loading}
            >
              清空本地列表
            </Button>
            <Button 
              type="primary" 
              icon={<IconRefresh />} 
              onClick={handleRefresh}
              loading={loading}
              disabled={activeTab === 'history'}
            >
              {t('common.refresh')}
            </Button>
            <Button 
              type="outline" 
              icon={<IconSettings />} 
              onClick={() => setSettingsVisible(true)}
            />
          </Space>
        }
      >
        <TabPane key="daily" title={t('tabs.daily')}>
          <RepositoryList repositories={repositories} />
        </TabPane>
        <TabPane key="weekly" title={t('tabs.weekly')}>
          <RepositoryList repositories={repositories} />
        </TabPane>
        <TabPane key="monthly" title={t('tabs.monthly')}>
          <RepositoryList repositories={repositories} />
        </TabPane>
        <TabPane 
          key="history" 
          title={
            <span>
              <IconHistory style={{ marginRight: 6 }} />
              历史记录
            </span>
          }
        >
          <RepositoryList repositories={historyRepos} />
        </TabPane>
      </Tabs>
      
      <SettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
      />
    </div>
  );
};

export default TrendingApp;