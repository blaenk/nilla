import React from 'react';
import { Badge, Glyphicon } from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import _ from 'lodash';

import File from './File';

import styles from './filetree.module.less';

/**
 * Partitions a list of file objects into folders and files.
 * @param {Object[]} entries - The list of file objects.
 * @param {string[]} entries[].pathComponents - The file's path components.
 * @param {number} entries[].size - The file's size.
 * @param {string} entries[].progress - The file's download progress.
 * @param {number} entries[].id - The file's rtorrent identifier.
 * @param {bool} entries[].enabled - Whether the file is enabled.
 * @param {number} depth - The current tree depth.
 * @returns {Array} - The first element is an array of folders, second is array of
 * files.
 */
function partitionFiles(entries, depth) {
  const folders = [], files = [], tree = {};

  for (const entry of entries) {
    if (depth + 1 < entry.pathComponents.length) {
      const name = entry.pathComponents[depth];

      tree[name] = tree[name] || [];
      tree[name].push(entry);
    } else {
      files.push(entry);
    }
  }

  _.forOwn(tree, (value, key) => {
    folders.push({
      name: key,
      files: value,
    });
  });

  return {
    folders,
    files,
  };
}

const FileTree = CSSModules(React.createClass({
  displayName: 'FileTree',
  propTypes: {
    name: React.PropTypes.string,
    files: React.PropTypes.arrayOf(React.PropTypes.shape(File.propTypes)),
    depth: React.PropTypes.number,
    isRoot: React.PropTypes.bool,
    isEnabled: React.PropTypes.bool,

    initialCollapse: React.PropTypes.bool,

    downloadName: React.PropTypes.string.isRequired,
    isMultiFile: React.PropTypes.bool.isRequired,
  },

  getDefaultProps() {
    return {
      depth: 0,
      isRoot: false,
    };
  },

  getInitialState() {
    return {
      isCollapsed: this.props.initialCollapse,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.initialCollapse !== nextProps.initialCollapse) {
      this.setState({ isCollapsed: nextProps.initialCollapse });
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.files !== nextProps.files ||
      this.state.isCollapsed !== nextState.isCollapsed;
  },

  collapse(_event) {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  },

  render() {
    const visibleCount = this.props.files.reduce((acc, file) => {
      return acc + (file.isHidden ? 0 : 1);
    }, 0);

    const maybeHide = (visibleCount > 0) ? {} : { display: 'none' };

    let tab;

    if (!this.props.isRoot) {
      tab = (
        <div styleName='folder-tab' onClick={this.collapse}>
          <Glyphicon styleName='collapse-mark'
                     glyph={this.state.isCollapsed ? 'chevron-down' : 'chevron-up'} />
          <div styleName='folder-name'>
            {this.props.name}
          </div>

          <Badge styleName='entry-count'>
            {visibleCount}
          </Badge>
        </div>
      );
    }

    if (!this.props.isRoot && this.state.isCollapsed) {
      return (
        <div styleName='file-tree' style={maybeHide}>
          {tab}
        </div>
      );
    }

    let { folders, files } = partitionFiles(this.props.files, this.props.depth);

    folders = folders.map(folder => {
      return (
        <FileTree name={folder.name}
                  key={folder.name}
                  depth={this.props.depth + 1}
                  initialCollapse={this.props.initialCollapse}
                  isMultiFile={this.props.isMultiFile}
                  downloadName={this.props.downloadName}
                  files={folder.files} />
      );
    });

    files = files.map(file => {
      return (
        <File size={file.size}
              isMultiFile={this.props.isMultiFile}
              isHidden={file.isHidden}
              downloadName={this.props.downloadName}
              progress={file.progress}
              isEnabled={file.isEnabled}
              pathComponents={file.pathComponents}
              id={file.id}
              key={file.id} />
      );
    });

    return (
      <div styleName={this.props.isRoot ? 'root-file-tree' : 'file-tree'}
           style={maybeHide}>
        {tab}

        <ul styleName='entries'>
          {folders}
          {files}
        </ul>
      </div>
    );
  },
}), styles);

export default FileTree;
