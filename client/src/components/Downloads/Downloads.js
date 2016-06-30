import React from 'react';
import CSSModules from 'react-css-modules';

import Search from './Search';
import Download from 'components/Downloads/Download';
import DownloadList from 'components/Downloads/DownloadList';

import styles from './styles.module.less';

const Downloads = React.createClass({
  propTypes: {
    downloads: React.PropTypes.arrayOf(React.PropTypes.shape(Download.propTypes)),
    onChangeFilter: React.PropTypes.func.isRequired,
    onChangeScope: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      filter: '',
      scope: 'all',
      order: 'recent'
    };
  },

  onChangeOrder: function(eventKey, _event) {
    this.setState({order: eventKey});
  },

  render: function() {
    let visibleCount = this.props.downloads.reduce((acc, next) => {
      return acc + (next.isHidden ? 0 : 1);
    }, 0);

    return (
      <div>
        <Search count={visibleCount}
                onChangeFilter={this.props.onChangeFilter}
                onChangeOrder={this.onChangeOrder}
                onChangeScope={this.props.onChangeScope}/>
        <DownloadList downloads={this.props.downloads} />
      </div>
    );
  }
});

export default CSSModules(Downloads, styles);
