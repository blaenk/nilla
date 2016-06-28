import React from 'react';
import CSSModules from 'react-css-modules';

import Search from './Search';
import Download from 'components/Downloads/Download';
import DownloadList from 'components/Downloads/DownloadList';

import styles from './styles.module.less';

import { fuzzyPattern } from 'common/util';

const Downloads = React.createClass({
  propTypes: {
    downloads: React.PropTypes.arrayOf(React.PropTypes.shape(Download.propTypes))
  },

  getInitialState: function() {
    return {
      filter: '',
      scope: 'all',
      order: 'recent'
    };
  },

  onChangeFilter: function(event) {
    this.setState({filter: event.target.value});
  },

  onChangeOrder: function(eventKey, _event) {
    this.setState({order: eventKey});
  },

  onChangeScope: function(eventKey, _event) {
    this.setState({scope: eventKey});
  },

  render: function() {
    const filterRE = fuzzyPattern(this.state.filter);

    let visibleCount = 0;

    let downloads = this.props.downloads.map(download => {
      download.isHidden = !filterRE.test(download.name);

      visibleCount += download.isHidden ? 0 : 1;

      return download;
    });

    return (
      <div>
        <Search count={visibleCount}
                onChangeFilter={this.onChangeFilter}
                onChangeOrder={this.onChangeOrder}
                onChangeScope={this.onChangeScope}/>
        <DownloadList downloads={downloads} />
      </div>
    );
  }
});

export default CSSModules(Downloads, styles);
