import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import TrendingApp from './components/TrendingApp';
import './styles/trending.css';
import '@arco-design/web-react/dist/css/arco.css';
import './i18n';
import { useTranslation } from 'react-i18next';

const App = () => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // 初始化时获取系统语言设置
    const initLanguage = async () => {
      try {
        const savedLang = await window.electron.invoke('get-language');
        if (savedLang && savedLang !== i18n.language) {
          i18n.changeLanguage(savedLang);
        }
      } catch (error) {
        console.error('获取语言设置失败:', error);
      }
    };
    
    initLanguage();
  }, []);
  
  // 根据当前语言选择 Arco Design 的语言包
  const locale = i18n.language === 'en' ? enUS : zhCN;
  
  return (
    <ConfigProvider locale={locale}>
      <TrendingApp />
    </ConfigProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);