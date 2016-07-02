import React from 'react';
import {
  Button,
  Checkbox,
  Col,
  Collapse,
  FormControl,
  Grid,
  InputGroup,
  Row
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import Dropzone from 'react-dropzone';

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
      isDragging: false,
      isUploading: true
    });

    console.log('received files', files);
  },

  onDropRejected: function(files) {
    this.setState({isDragging: false});

    let fileString = files.map(file => {
      return `- ${file.name}`;
    }).join("\n");

    window.alert(`one or more files is not a torrent!\n\n${fileString}`);
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
                  isDragging={this.state.isDragging}/>
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
