import React from 'react';
import CSSModules from 'react-css-modules';

import Search from './Search';
import Download from 'components/Downloads/Download';
import DownloadList from 'components/Downloads/DownloadList';

import styles from './styles.module.less';

const Downloads = React.createClass({
  propTypes: {
    downloads: React.PropTypes.arrayOf(React.PropTypes.shape(Download.propTypes))
  },

  render: function() {
    return (
      <div>
        <Search count={this.props.downloads.length} />
        <DownloadList downloads={this.props.downloads} />
      </div>
    );
  }
});

export default CSSModules(Downloads, styles);
