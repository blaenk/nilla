import React from 'react';
import { Badge } from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './filetree.module.less';

const File = React.createClass({
  propTypes: {
    path: React.PropTypes.string.isRequired,
    pathComponents: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    size: React.PropTypes.number.isRequired,
    id: React.PropTypes.number.isRequired,
    progress: React.PropTypes.number.isRequired,
    enabled: React.PropTypes.bool.isRequired,

    // download-props
    downloadName: React.PropTypes.string.isRequired,
    isMultiFile: React.PropTypes.bool.isRequired
  },

  render: function() {
    const path = this.props.pathComponents.join('/');
    const basename = this.props.pathComponents[this.props.pathComponents.length - 1];
    const size = filesize(this.props.size);

    const isFinished = this.props.progress == 100;
    const isDisabled = !this.props.enabled;

    const encodedName = encodeURIComponent(this.props.downloadName);
    const encodedUrl = encodeURIComponent(path);

    let url;

    if (this.props.isMultiFile) {
      url = `/file/${encodedName}/${encodedUrl}`;
    } else {
      url = `/file/${encodedUrl}`;
    }

    const disabledOr = style => {
      return isDisabled ? 'file-disabled' : style;
    };

    let nameTag, badge;

    if (isFinished) {
      nameTag = <a href={url} styleName='file-name'>{basename}</a>;
      badge = <Badge styleName={disabledOr('file-size')}>{size}</Badge>;
    } else {
      nameTag = <span styleName='file-name-incomplete'>{basename}</span>;
      badge = <Badge styleName={disabledOr('file-progress')}>{this.props.progress}</Badge>;
    }

    return (
      <li styleName='file'>
        {nameTag}
        {badge}
      </li>
    );
  }
});

export default CSSModules(File, styles);
