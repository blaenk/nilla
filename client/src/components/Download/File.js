import React from 'react';
import { Badge } from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './filetree.module.less';

const File = React.createClass({
  propTypes: {
    pathComponents: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    size: React.PropTypes.number.isRequired,
    id: React.PropTypes.number.isRequired,
    progress: React.PropTypes.number.isRequired,
    enabled: React.PropTypes.bool.isRequired,
    isHidden: React.PropTypes.bool.isRequired,

    // download-props
    downloadName: React.PropTypes.string.isRequired,
    isMultiFile: React.PropTypes.bool.isRequired
  },

  render: function() {
    const basename = this.props.pathComponents[this.props.pathComponents.length - 1];
    const size = filesize(this.props.size);

    const isFinished = this.props.progress == 100;
    const isDisabled = !this.props.enabled;

    const encodedName = this.props.downloadName;
    const encodedPath = this.props.pathComponents.map(encodeURIComponent).join('/');

    let url;

    if (this.props.isMultiFile) {
      url = `/file/${encodedName}/${encodedPath}`;
    } else {
      url = `/file/${encodedPath}`;
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

    let maybeHide = this.props.isHidden ? {display: 'none'} : {};

    return (
      <li styleName='file' style={maybeHide}>
        {nameTag}
        {badge}
      </li>
    );
  }
});

export default CSSModules(File, styles);
