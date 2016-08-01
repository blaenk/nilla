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

let FileUpload_ = (props) => {
  let right;

  if (props.file.progress > 0) {
    right = (
      <ProgressBar styleName='upload-progress'
                   now={props.file.progress}
                   label={`${props.file.progress}%`} />
    );
  } else {
    right = (
      <div>
        <StartCheckbox inline file={props.file} defaultChecked={props.file.start}>
          start
        </StartCheckbox>

        <Button bsStyle='danger' bsSize='xsmall' styleName='file-button' title='remove'
                onClick={props.onRemove}>
          <Glyphicon glyph='remove' />
        </Button>

        <Button bsStyle='success' bsSize='xsmall' styleName='file-button' title='upload'
                onClick={props.onSubmit}>
          <Glyphicon glyph='arrow-up' />
        </Button>
      </div>
    );
  }

  return (
    <li styleName='file'>
      <span styleName='name'>{props.file.backingFile.name}</span>

      <Label styleName='size'>{filesize(props.file.backingFile.size)}</Label>

      {right}
    </li>
  );
};

FileUpload_.propTypes = {
  file: React.PropTypes.object.isRequired,
  onRemove: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
};

FileUpload_ = CSSModules(FileUpload_, styles);

FileUpload_ = connect(
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
)(FileUpload_);

const FileUpload = FileUpload_;

export default FileUpload;
