import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col } from 'react-bootstrap';

import Header from './Header';
import Search from './Search';
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

  getInitialState: function() {
    return {
      filter: '',
      isCollapsed: true
    };
  },

  onCollapse: function(_event) {
    this.setState({isCollapsed: !this.state.isCollapsed});
  },

  onChangeFilter: function(event) {
    this.setState({filter: event.target.value});
  },

  render: function() {
    const filter = this.state.filter || '';
    const files = this.props.files.filter(file => {
      return file.path.includes(filter);
    });

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
            <Search count={files.length}
                    onChangeFilter={this.onChangeFilter}
                    onCollapse={this.onCollapse} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div styleName='files'>
              <FileTree isMultiFile={this.props.isMultiFile}
                        initialCollapse={this.state.isCollapsed}
                        downloadName={this.props.name}
                        files={files} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
});

export default CSSModules(Download, styles);
