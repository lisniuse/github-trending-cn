import React from 'react';
import { Tabs } from '@arco-design/web-react';
import RepositoryList from './components/RepositoryList';
import HistoryList from './components/HistoryList';
import { useTranslation } from 'react-i18next';
import { saveRepositories } from './utils/storage';

const TabPane = Tabs.TabPane;

const App = () => {
  const { t } = useTranslation();
  const [repositories, setRepositories] = React.useState([]);
  
  // 获取trending数据的代码保持不变...

  // 在获取到新数据后保存
  React.useEffect(() => {
    if (repositories.length > 0) {
      saveRepositories(repositories);
    }
  }, [repositories]);

  return (
    <div className="app">
      <Tabs defaultActiveTab="1">
        <TabPane key="1" title={t('common.trending')}>
          <RepositoryList repositories={repositories} />
        </TabPane>
        <TabPane key="2" title={t('common.history')}>
          <HistoryList />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;