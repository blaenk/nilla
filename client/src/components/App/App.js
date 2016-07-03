import React from 'react';
import {
  Collapse,
  Grid,
  Table
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import Dropzone from 'react-dropzone';
import filesize from 'filesize';

import Header from './Header';
import Upload from './Upload';
import ErrorAlert from './ErrorAlert';

import styles from 'styles/app.module.less';

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
        <ErrorAlert title="Unrecognized File!"
                    onDismiss={this.dismissRejectionAlert}>
          <p>
            One or more of the files you chose is not a torrent! Please try
            again without the offending files.
          </p>

          <p>Here are the files you attempted to upload:</p>

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
        </ErrorAlert>
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
              <Upload onClickFiles={() => this.refs.dropzone.open()}
                      onClickUpload={() => console.log('clicked upload')}
                      onSubmitMagnet={() => console.log('submit magnet')} />
            </div>
          </Collapse>

          {this.props.children}
        </Grid>
      </Dropzone>
    );
  }
});

module.exports = CSSModules(App, styles);
