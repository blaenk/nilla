import React from 'react';
import CSSModules from 'react-css-modules';

import Header from './Header';
import Search from './Search';
import FilteredDownloadList from 'containers/Downloads/FilteredDownloadList';

import styles from './styles.module.less';

const Downloads = React.createClass({
  render: function() {
    return (
      <div>
        <Header />
        <Search />
        <FilteredDownloadList />
      </div>
    );
  }
});

export default CSSModules(Downloads, styles);
