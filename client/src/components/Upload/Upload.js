import React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import FileUploadContainer from 'containers/Upload/FileUploadContainer';

import RejectedFilesErrorAlert from './RejectedFilesErrorAlert';
import MagnetURI from './MagnetURI';

import { submitAllFiles } from 'actions';

import styles from './upload.module.less';

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

class Upload extends React.PureComponent {
  render() {
    const files = this.props.files.map(file => (
      <FileUploadContainer file={file} key={file.backingFile.preview} />
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
  }
}

Upload.propTypes = {
  files: React.PropTypes.array,
  onClickFiles: React.PropTypes.func.isRequired,
  onDismissRejectionAlert: React.PropTypes.func.isRequired,
  rejectedFiles: React.PropTypes.array,
};

export default CSSModules(Upload, styles);
