import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './filetree.module.less';

class File extends React.PureComponent {
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
    if (!this.props.ui) {
      return null;
    }

    const basename = this.props.pathComponents[this.props.pathComponents.length - 1];
    const size = filesize(this.props.size);

    const PROGRESS_COMPLETE = 100;

    const isFinished = this.props.progress === PROGRESS_COMPLETE;
    const isDisabled = !this.props.isEnabled;

    const encodedName = encodeURIComponent(this.props.downloadName);
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
      nameTag = (
        <a href={url} styleName='file-name' target='_blank' rel='noopener'>
          {basename}
        </a>
      );
    } else {
      nameTag = <span styleName='file-name-incomplete'>{basename}</span>;
    }

    if (isFinished) {
      badge = <Badge styleName={disabledOr('file-size')}>{size}</Badge>;
    } else {
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
  canDownload: PropTypes.bool.isRequired,
  disable: PropTypes.func.isRequired,
  downloadName: PropTypes.string.isRequired,
  enable: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isEnabled: PropTypes.bool.isRequired,
  isMultiFile: PropTypes.bool.isRequired,
  pathComponents: PropTypes.array.isRequired,
  progress: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  ui: PropTypes.object.isRequired,
};

export default CSSModules(File, styles);
