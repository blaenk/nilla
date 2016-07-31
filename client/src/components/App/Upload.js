import React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import styles from './upload.module.less';

import RejectedFilesErrorAlert from './RejectedFilesErrorAlert';
import MagnetURI from './MagnetURI';
import FileUpload from './FileUpload';

import { submitAllFiles } from 'actions';

const UploadAllButton = connect(
  null,
  (dispatch) => {
    return {
      onClick() {
        dispatch(submitAllFiles());
      },
    };
  }
)(Button);

const Upload = React.createClass({
  propTypes: {
    files: React.PropTypes.array,
    rejectedFiles: React.PropTypes.array,
    onClickFiles: React.PropTypes.func.isRequired,
    onDismissRejectionAlert: React.PropTypes.func.isRequired,
  },

  render() {
    let files = this.props.files.map(file => (
      <FileUpload file={file} key={file.backingFile.preview} />
    ));

    return (
      <div styleName='upload'>
        <RejectedFilesErrorAlert rejectedFiles={this.props.rejectedFiles}
                                 onDismiss={this.props.onDismissRejectionAlert} />

        <Row>
          <Col lg={12}>
            <MagnetURI />
          </Col>
        </Row>

        <hr styleName='separator' />

        <Row>
          <Col xs={6} styleName='choose-files'>
            <Button bsStyle='primary' styleName='button' onClick={this.props.onClickFiles}>
              choose files
            </Button>
          </Col>

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
  },
});

export default CSSModules(Upload, styles);
