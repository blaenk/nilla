import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col } from 'react-bootstrap';

import Header from './Header';
import FileTree from './FileTree';
import File from './File';

import styles from './download.module.less';

const filesProps = File.propTypes;
delete filesProps['isMultiFile'];
delete filesProps['downloadName'];

const Download = React.createClass({
  propTypes: {
    infohash: React.PropTypes.string.isRequired,
    dateAdded: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    state: React.PropTypes.string.isRequired,
    progress: React.PropTypes.number.isRequired,
    isMultiFile: React.PropTypes.bool.isRequired,
    uploader: React.PropTypes.string.isRequired,
    files: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
    locks: React.PropTypes.array.isRequired
  },

  render: function() {
    return (
      <div>
        <Row>
          <Col lg={12}>
            <Header infohash={this.props.infohash}
                    dateAdded={this.props.dateAdded}
                    name={this.props.name}
                    state={this.props.state}
                    progress={this.props.progress}
                    uploader={this.props.uploader}
                    locks={this.props.locks} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div styleName='files'>
              <FileTree isMultiFile={this.props.isMultiFile}
                        downloadName={this.props.name}
                        files={this.props.files} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
});

export default CSSModules(Download, styles);
