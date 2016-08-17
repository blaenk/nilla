import React from 'react';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './upload.module.less';

function FileItem(props) {
  const name = props.pathComponents[props.pathComponents.length - 1];

  return (
    <li key={props.path}>
      {name}

      <span styleName='torrent-separator'>—</span>

      <span styleName='torrent-size'>
        {filesize(props.size)}
      </span>
    </li>
  );
}

FileItem.propTypes = {
  path: React.PropTypes.string,
  pathComponents: React.PropTypes.array,
  size: React.PropTypes.number,
};

export default CSSModules(FileItem, styles);
