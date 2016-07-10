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
  Row,
  Table
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './upload.module.less';

import ErrorAlert from './ErrorAlert';

import { submitFile } from 'actions';

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

let UploadButton = React.createClass({
  render: function() {
      return (
        <Button bsStyle='success' bsSize='xsmall' styleName='file-button' title='upload'
                onClick={this.props.onClick}>
          <Glyphicon glyph='arrow-up' />
        </Button>
      );
    }
});

UploadButton = CSSModules(UploadButton, styles);

UploadButton = connect(
  null,
  (dispatch, ownProps) => {
    return {
      onClick: function() {
        dispatch(submitFile(ownProps.file));
      }
    };
  }
)(UploadButton);

let FileUpload = React.createClass({
  render: function() {
    return (
      <li styleName='file'>
        <span styleName='name'>{this.props.file.name}</span>

        <Label styleName='size'>{filesize(this.props.file.size)}</Label>

        <Button bsStyle='danger' bsSize='xsmall' styleName='file-button' title='remove'>
          <Glyphicon glyph='remove' />
        </Button>

        <UploadButton file={this.props.file} />
      </li>
    );
  }
});

FileUpload = CSSModules(FileUpload, styles);

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
    let files = this.props.files.map(file => <FileUpload file={file} key={file.name} />);

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
            <Button bsStyle='success' styleName='button' onClick={this.onClickUpload}>
              upload all
            </Button>
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
