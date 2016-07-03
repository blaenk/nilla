import React from 'react';
import {
  Collapse,
  Grid
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import Dropzone from 'react-dropzone';

import Header from './Header';
import Upload from './Upload';

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
      isUploading: true,
      rejectedFiles: files
    });
  },

  dismissRejectionAlert: function() {
    this.setState({rejectedFiles: null});
  },

  render: function() {
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

          <Collapse in={this.state.isUploading}>
            <div>
              <Upload rejectedFiles={this.state.rejectedFiles}
                      onDismissRejectionAlert={this.dismissRejectionAlert}
                      onClickFiles={() => this.refs.dropzone.open()}
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
