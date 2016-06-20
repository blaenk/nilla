import React from 'react';
import CSSModules from 'react-css-modules';

import Header from './Header';
import Search from './Search';
import Download from './Download';

import { Navbar, Nav, NavItem } from 'react-bootstrap';

import styles from './styles.module.less';

const Downloads = React.createClass({
  propTypes: {
    downloads: React.PropTypes.array.isRequired
  },

  getDefaultProps: function() {
    return {
      downloads: [
        {
          infohash: '123456',
          state: 'downloading',
          progress: '75',
          name: 'ubuntu',
          locks: []
        }
      ]
    };
  },

  render: function() {
    let downloads = this.props.downloads.map(download => {
      // return React.createElement(Download, Object.assign({}, download));
      return (
        <Download key={download.infohash}
                  infohash={download.infohash}
                  state={download.state}
                  progress={download.progress}
                  name={download.name}
                  locks={download.locks} />
      );
    });

    return (
      <div>
        <Header />
        <Search count={downloads.length} />
        <ul styleName='downloads'>
          {downloads}
        </ul>
      </div>
    );
  }
});

export default CSSModules(Downloads, styles);
