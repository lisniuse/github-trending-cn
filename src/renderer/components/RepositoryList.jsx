import React from 'react';
import { Card, Tag, Typography, Space, Tooltip } from '@arco-design/web-react';
import { IconStar, IconCode, IconBranch } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';
import '../styles/RepositoryList.css';  // 添加这一行

const { Text, Paragraph, Title } = Typography;

const RepositoryList = ({ repositories }) => {
  const { t } = useTranslation();
  
  if (!repositories || repositories.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('common.noRepositories')}</p>
      </div>
    );
  }
  
  const handleRepoClick = async (url) => {
    try {
      await window.electron.openExternal(url);
    } catch (error) {
      console.error('打开链接失败:', error);
    }
  };
  
  return (
    <div className="repository-list">
      {repositories.map((repo, index) => (
        <Card 
          key={`${repo.author}-${repo.repoName}-${index}`}
          className="repository-card"
          hoverable
          onClick={() => handleRepoClick(repo.repoUrl)}
        >
          <div className="repo-header">
            <Title 
              heading={5} 
              style={{ margin: 0, cursor: 'pointer' }}
              className="repo-title"
            >
              {repo.author} / {repo.repoName}
            </Title>
            <div className="repo-stats">
              <Space>
                {repo.language && (
                  <Tooltip content={t('common.language')}>
                    <Tag color="arcoblue" icon={<IconCode />}>
                      {repo.language}
                    </Tag>
                  </Tooltip>
                )}
                <Tooltip content={t('common.stars')}>
                  <Tag icon={<IconStar />}>
                    {repo.stars}
                  </Tag>
                </Tooltip>
                <Tooltip content={t('common.forks')}>
                  <Tag icon={<IconBranch />}>
                    {repo.forks}
                  </Tag>
                </Tooltip>
                {repo.starsToday && (
                  <Tooltip content={t('common.starsToday')}>
                    <Tag color="green">
                      +{repo.starsToday}
                    </Tag>
                  </Tooltip>
                )}
              </Space>
            </div>
          </div>
          
          <div className="repo-description">
            <Paragraph ellipsis={{ rows: 3 }}>
              {repo.description || t('common.noDescription')}
            </Paragraph>
            
            {repo.originalDescription && (
              <Tooltip content={repo.originalDescription}>
                <Text type="secondary" className="original-text-hint">
                  {t('common.showOriginal')}
                </Text>
              </Tooltip>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RepositoryList;