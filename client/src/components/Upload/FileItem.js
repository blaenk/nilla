import React from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './upload.module.less';

class FileItem extends React.PureComponent {
  render() {
    const name = this.props.pathComponents[this.props.pathComponents.length - 1];

    return (
      <li key={this.props.path}>
        {name}

        <span styleName='torrent-separator'>—</span>

        <span styleName='torrent-size'>
          {filesize(this.props.size)}
        </span>
      </li>
    );
  }
}

FileItem.propTypes = {
  path: PropTypes.string,
  pathComponents: PropTypes.array,
  size: PropTypes.number,
};

export default CSSModules(FileItem, styles);
