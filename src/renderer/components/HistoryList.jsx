import React from 'react';
import RepositoryList from './RepositoryList';
import { getStoredRepositories } from '../utils/storage';

const HistoryList = () => {
  const [repositories, setRepositories] = React.useState([]);

  React.useEffect(() => {
    const storedRepos = getStoredRepositories();
    setRepositories(storedRepos);
  }, []);

  return <RepositoryList repositories={repositories} />;
};

export default HistoryList;