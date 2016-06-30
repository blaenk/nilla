import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col } from 'react-bootstrap';

import Header from './Header';
import Search from './Search';
import FileTree from './FileTree';
import File from './File';

import styles from './download.module.less';

import { fuzzyPattern } from 'common';

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
      globalCollapse: true
    };
  },

  onGlobalCollapse: function(_event) {
    this.setState({globalCollapse: !this.state.globalCollapse});
  },

  onChangeFilter: function(event) {
    this.setState({filter: event.target.value});
  },

  render: function() {
    const filterRE = fuzzyPattern(this.state.filter);

    let visibleCount = 0;

    const files = this.props.files.map(file => {
      file.isHidden = !filterRE.test(file.path);

      visibleCount += file.isHidden ? 0 : 1;

      return file;
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
            <Search count={visibleCount}
                    onChangeFilter={this.onChangeFilter}
                    onCollapse={this.onGlobalCollapse} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div styleName='files'>
              <FileTree isMultiFile={this.props.isMultiFile}
                        initialCollapse={this.state.globalCollapse}
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
