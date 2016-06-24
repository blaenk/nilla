import React from 'react';
import CSSModules from 'react-css-modules';

import Header from './Header';
import Search from './Search';
import DownloadList from './DownloadList';

import styles from './styles.module.less';

const Downloads = React.createClass({
  propTypes: {
    downloads: React.PropTypes.array.isRequired,
    scope: React.PropTypes.string.isRequired,
    order: React.PropTypes.string.isRequired,
    onChangeScope: React.PropTypes.func.isRequired,
    onChangeOrder: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div>
        <Header />
        <Search count={this.props.downloads.length} scope={this.props.scope} order={this.props.order}
                onChangeScope={this.props.onChangeScope}
                onChangeOrder={this.props.onChangeOrder} />
        <DownloadList downloads={this.props.downloads} />
      </div>
    );
  }
});

export default CSSModules(Downloads, styles);
