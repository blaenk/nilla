import React from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Collapse,
  FormControl,
  Grid,
  InputGroup,
  Row,
  Table
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import Dropzone from 'react-dropzone';
import filesize from 'filesize';

import Header from './Header';
import styles from 'styles/app.module.less';

const Upload = React.createClass({
  render: function() {
    return (
      <div>
        <Row styleName='search'>
          <Col lg={12}>
            <InputGroup>
              <FormControl type='text'
                           placeholder='Magnet URI'
                           autoFocus={true}
                           styleName='search-filter' />
              <InputGroup.Addon>
                <Checkbox inline>start</Checkbox>
              </InputGroup.Addon>
              <InputGroup.Button>
                <Button onClick={this.props.onSubmitMagnet}>submit</Button>
              </InputGroup.Button>
            </InputGroup>
          </Col>
        </Row>

        <Row styleName='search'>
          <Col lg={12}>
            <Button onClick={this.props.onClickFiles}>files</Button>
            <Button onClick={this.props.onClickUpload}>upload all</Button>
          </Col>
        </Row>
      </div>
    );
  }
});

const App = React.createClass({
  propTypes: {
    children: React.PropTypes.node.isRequired
  },

  getInitialState: function() {
    return {
      isUploading: false,
      isDragging: false
    };
  },

  onDropAccepted: function(files) {
    this.setState({
      rejectedFiles: null,
      isDragging: false,
      isUploading: true
    });

    console.log('received files', files);
  },

  onDropRejected: function(files) {
    this.setState({
      isDragging: false,
      rejectedFiles: files
    });
  },

  dismissRejectionAlert: function() {
    this.setState({rejectedFiles: null});
  },

  render: function() {
    // TODO
    // create a collection of errors that can be shown

    let rejectionError;

    if (this.state.rejectedFiles) {
      let files = this.state.rejectedFiles.map(file => {
        return (
          <tr key={file.name}>
            <td>{file.name}</td>
            <td>{filesize(file.size)}</td>
            <td>{file.type || 'unknown'}</td>
          </tr>
        );
      });

      rejectionError = (
        <Alert bsStyle='danger' styleName='file-rejection-error'
               onDismiss={this.dismissRejectionAlert}
               closeLabel='dismiss'>
          <h4>Unrecognized File!</h4>
          <p>
            One or more of the files you chose is not a torrent! Please try
            again without the offending files.
          </p>
          <br />
          <Table striped responsive styleName='rejected-files'>
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
        </Alert>
      );
    }

    return (
      <Dropzone onDropAccepted={this.onDropAccepted}
                onDropRejected={this.onDropRejected}
                onDragEnter={(_e) => this.setState({isDragging: true}) }
                onDragLeave={(_e) => this.setState({isDragging: false}) }
                style={{}}
                disableClick={true}
                ref="dropzone"
                accept={"application/x-bittorrent"}>
        <Grid>
          <Header onUpload={() => this.setState({isUploading: !this.state.isUploading})}
                  isDragging={this.state.isDragging} />

          {rejectionError}

          <Collapse in={this.state.isUploading}>
            <div>
              <Upload onClickFiles={() => this.refs.dropzone.open()} />
            </div>
          </Collapse>

          {this.props.children}
        </Grid>
      </Dropzone>
    );
  }
});

module.exports = CSSModules(App, styles);
