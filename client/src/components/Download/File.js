import React from 'react';
import { Badge } from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './filetree.module.less';

class File extends React.Component {
  constructor(props) {
    super(props);

    this.handleEnable = this.handleEnable.bind(this);
    this.handleDisable = this.handleDisable.bind(this);
  }

  handleEnable(_event) {
    this.props.enable(this.props.id);
  }

  handleDisable(_event) {
    this.props.disable(this.props.id);
  }

  render() {
    const basename = this.props.pathComponents[this.props.pathComponents.length - 1];
    const size = filesize(this.props.size);

    const PROGRESS_COMPLETE = 100;

    const isFinished = this.props.progress === PROGRESS_COMPLETE;
    const isDisabled = !this.props.isEnabled;

    const encodedName = encodeURIComponent(this.props.downloadName).replace(/%20/g, '+');
    const encodedPath = this.props.pathComponents.map(c => {
      return encodeURIComponent(c).replace(/%20/g, '+');
    }).join('/');

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

    if (this.props.isEditing) {
      const isEnabled = this.props.ui.filePriorities[this.props.id];

      nameTag = (
        <span styleName={isEnabled ? 'file-name-enabled' : 'file-name-disabled'}
              onClick={isEnabled ? this.handleDisable : this.handleEnable}>
          {basename}
        </span>
      );
    }

    return (
      <li styleName='file'>
        {nameTag}
        {badge}
      </li>
    );
  }
}

File.propTypes = {
  disable: React.PropTypes.func.isRequired,
  downloadName: React.PropTypes.string.isRequired,
  enable: React.PropTypes.func.isRequired,
  id: React.PropTypes.number.isRequired,
  isEditing: React.PropTypes.bool.isRequired,
  isEnabled: React.PropTypes.bool.isRequired,
  isMultiFile: React.PropTypes.bool.isRequired,
  pathComponents: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  progress: React.PropTypes.number.isRequired,
  size: React.PropTypes.number.isRequired,
  ui: React.PropTypes.object.isRequired,
};

export default CSSModules(File, styles);
