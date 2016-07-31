import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Checkbox,
  Glyphicon,
  Label,
  ProgressBar,
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './upload.module.less';

import { removeFile, submitFile, setFileStart } from 'actions';

const StartCheckbox = connect(
  null,
  (dispatch, ownProps) => {
    return {
      onChange(event) {
        dispatch(setFileStart(ownProps.file, event.target.checked));
      },
    };
  }
)(Checkbox);

let FileUpload = React.createClass({
  propTypes: {
    file: React.PropTypes.object.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
  },

  render() {
    let right;

    if (this.props.file.progress > 0) {
      right = (
        <ProgressBar styleName='upload-progress'
                     now={this.props.file.progress}
                     label={`${this.props.file.progress}%`} />
      );
    } else {
      right = (
        <div>
          <StartCheckbox inline file={this.props.file} defaultChecked={this.props.file.start}>
            start
          </StartCheckbox>

          <Button bsStyle='danger' bsSize='xsmall' styleName='file-button' title='remove'
                  onClick={this.props.onRemove}>
            <Glyphicon glyph='remove' />
          </Button>

          <Button bsStyle='success' bsSize='xsmall' styleName='file-button' title='upload'
                  onClick={this.props.onSubmit}>
            <Glyphicon glyph='arrow-up' />
          </Button>
        </div>
      );
    }

    return (
      <li styleName='file'>
        <span styleName='name'>{this.props.file.backingFile.name}</span>

        <Label styleName='size'>{filesize(this.props.file.backingFile.size)}</Label>

        {right}
      </li>
    );
  },
});

FileUpload = CSSModules(FileUpload, styles);

FileUpload = connect(
  null,
  (dispatch, ownProps) => {
    return {
      onSubmit() {
        dispatch(submitFile(ownProps.file));
      },
      onRemove() {
        dispatch(removeFile(ownProps.file));
      },
    };
  }
)(FileUpload);

export default FileUpload;
