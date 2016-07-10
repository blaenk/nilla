import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Checkbox,
  Col,
  FormControl,
  Glyphicon,
  InputGroup,
  Label,
  ProgressBar,
  Row,
  Table
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './upload.module.less';

import ErrorAlert from './ErrorAlert';

import { removeFile, submitFile, submitAllFiles, setFileStart } from 'actions';

const RejectedFilesErrorAlert = React.createClass({
  propTypes: {
    rejectedFiles: React.PropTypes.array,
    onDismiss: React.PropTypes.func.isRequired
  },

  render: function() {
    if (this.props.rejectedFiles.length > 0) {
      let files = this.props.rejectedFiles.map(file => {
        return (
          <tr key={file.name}>
            <td>{file.name}</td>
            <td>{filesize(file.size)}</td>
            <td>{file.type || 'unknown'}</td>
          </tr>
        );
      });

      return (
        <ErrorAlert title="Unrecognized File!"
                    onDismiss={this.props.onDismiss}>
          <p>
            One or more of the files you chose is not a torrent! Please try
            again without those files.
          </p>

          <p>Here are the files you attempted to upload:</p>

          <Table striped responsive>
            <thead>
              <tr>
                <th>name</th>
                <th>size</th>
                <th>type</th>
              </tr>
            </thead>
            <tbody>
              {files}
            </tbody>
          </Table>
        </ErrorAlert>
      );
    }

    return null;
  }
});

const StartCheckbox = connect(
  null,
  (dispatch, ownProps) => {
    return {
      onChange: function(event) {
        dispatch(setFileStart(ownProps.file, event.target.checked));
      }
    };
  }
)(Checkbox);

let FileUpload = React.createClass({
  render: function() {
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
          <StartCheckbox inline file={this.props.file} checked={this.props.file.start}>
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
  }
});

FileUpload = CSSModules(FileUpload, styles);

FileUpload = connect(
  null,
  (dispatch, ownProps) => {
    return {
      onSubmit: function() {
        dispatch(submitFile(ownProps.file));
      },
      onRemove: function() {
        dispatch(removeFile(ownProps.file.backingFile));
      }
    };
  }
)(FileUpload);

const UploadAllButton = connect(
  null,
  (dispatch) => {
    return {
      onClick: function() {
        dispatch(submitAllFiles());
      }
    };
  }
)(Button);

const Upload = React.createClass({
  propTypes: {
    rejectedFiles: React.PropTypes.array,
    onSubmitMagnet: React.PropTypes.func.isRequired,
    onClickFiles: React.PropTypes.func.isRequired,
    onClickUpload: React.PropTypes.func.isRequired,
    onDismissRejectionAlert: React.PropTypes.func.isRequired
  },

  onClickUpload: function(event) {
    console.log(event);
  },

  render: function() {
    let files = this.props.files.map(file => (
      <FileUpload file={file} key={file.backingFile.preview} />
    ));

    return (
      <div styleName='upload'>
        <RejectedFilesErrorAlert rejectedFiles={this.props.rejectedFiles}
                                 onDismiss={this.props.onDismissRejectionAlert} />

        <Row>
          <Col lg={12}>
            <InputGroup>
              <FormControl type='text'
                           placeholder='Magnet URI'
                           autoFocus={true}
                           styleName='magnet-uri' />

              <InputGroup.Addon styleName='start-magnet'>
                <Checkbox inline>start</Checkbox>
              </InputGroup.Addon>

              <InputGroup.Button>
                <Button bsStyle='success' styleName='button' onClick={this.props.onSubmitMagnet}>
                  submit
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </Col>
        </Row>

        <hr styleName='separator' />

        <Row>
          <Col xs={6} styleName='choose-files'>
            <Button bsStyle='primary' styleName='button' onClick={this.props.onClickFiles}>
              choose files
            </Button>
          </Col>

          {/* TODO move this to bottom of download rows? */}
          <Col xs={6}>
            <UploadAllButton bsStyle='success' styleName='button'>
              upload all
            </UploadAllButton>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <ul styleName='files'>
              {files}
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
});

export default CSSModules(Upload, styles);
