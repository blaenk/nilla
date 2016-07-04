import React from 'react';
import {
  Button,
  Checkbox,
  Col,
  FormControl,
  InputGroup,
  Row,
  Table
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './upload.module.less';

import ErrorAlert from './ErrorAlert';

const RejectedFilesErrorAlert = React.createClass({
  propTypes: {
    rejectedFiles: React.PropTypes.array,
    onDismiss: React.PropTypes.func.isRequired
  },

  render: function() {
    if (this.props.rejectedFiles) {
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

const Upload = React.createClass({
  propTypes: {
    rejectedFiles: React.PropTypes.array,
    onSubmitMagnet: React.PropTypes.func.isRequired,
    onClickFiles: React.PropTypes.func.isRequired,
    onClickUpload: React.PropTypes.func.isRequired,
    onDismissRejectionAlert: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div>
        <RejectedFilesErrorAlert rejectedFiles={this.props.rejectedFiles}
                                 onDismiss={this.props.onDismissRejectionAlert} />

        <Row styleName='upload'>
          <Col lg={12}>
            <InputGroup>
              <FormControl type='text'
                           placeholder='Magnet URI'
                           autoFocus={true}
                           styleName='magnet-uri' />

              <InputGroup.Addon>
                <Checkbox inline>start</Checkbox>
              </InputGroup.Addon>

              <InputGroup.Button>
                <Button onClick={this.props.onSubmitMagnet}>submit</Button>
              </InputGroup.Button>
            </InputGroup>
          </Col>
        </Row>

        <Row styleName='buttons'>
          <Col lg={12}>
            <Button onClick={this.props.onClickFiles}>files</Button>
            <Button onClick={this.props.onClickUpload}>upload all</Button>
          </Col>
        </Row>
      </div>
    );
  }
});

export default CSSModules(Upload, styles);
