import React from 'react';
import { Badge, Glyphicon } from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import _ from 'lodash';

import File from './File';

import styles from './filetree.module.less';

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

class FileTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isCollapsed: this.props.initialCollapse,
    };

    this.handleTabClick = this.handleTabClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.initialCollapse !== nextProps.initialCollapse) {
      this.setState({ isCollapsed: nextProps.initialCollapse });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.files !== nextProps.files ||
      this.state.isCollapsed !== nextState.isCollapsed ||
      this.props.isEditing !== nextProps.isEditing;
  }

  handleTabClick(_event) {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  }

  render() {
    const fileCount = this.props.files.length;

    const maybeHide = (fileCount > 0) ? {} : { display: 'none' };

    let tab;

    if (!this.props.isRoot) {
      tab = (
        <div className={this.props.styles['folder-tab']} onClick={this.handleTabClick}>
          <Glyphicon className={this.props.styles['collapse-mark']}
                     glyph={this.state.isCollapsed ? 'chevron-down' : 'chevron-up'} />
          <div className={this.props.styles['folder-name']}>
            {this.props.name}
          </div>

          <Badge className={this.props.styles['entry-count']}>
            {fileCount}
          </Badge>
        </div>
      );
    }

    if (!this.props.isRoot && this.state.isCollapsed) {
      return (
        <div className={this.props.styles['file-tree']} style={maybeHide}>
          {tab}
        </div>
      );
    }

    let { folders, files } = partitionFiles(this.props.files, this.props.depth);

    folders = folders.sort((a, b) => {
      return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
    });

    folders = folders.map(folder => {
      return (
        <FileTree name={folder.name}
                  key={folder.name}
                  isEditing={this.props.isEditing}
                  styles={this.props.styles}
                  depth={this.props.depth + 1}
                  initialCollapse={this.props.initialCollapse}
                  isMultiFile={this.props.isMultiFile}
                  downloadName={this.props.downloadName}
                  files={folder.files} />
      );
    });

    files = files.sort((a, b) => {
      const aName = a.pathComponents[a.pathComponents.length - 1];
      const bName = b.pathComponents[b.pathComponents.length - 1];

      return aName.toLocaleLowerCase().localeCompare(bName.toLocaleLowerCase());
    });

    files = files.map(file => {
      // The key should be e.g. FolderName:3
      // There can't be multiple adjacent folders with the same name, and the
      // key only needs to be unique between siblings?
      const key = file.pathComponents[this.props.depth] + ':' + file.id;

      return (
        <File size={file.size}
              isEditing={this.props.isEditing}
              styles={this.props.styles}
              isMultiFile={this.props.isMultiFile}
              downloadName={this.props.downloadName}
              progress={file.progress}
              isEnabled={file.isEnabled}
              pathComponents={file.pathComponents}
              id={file.id}
              key={key} />
      );
    });

    let treeClass = this.props.styles['file-tree'];

    if (this.props.isRoot) {
      treeClass = this.props.styles['root-file-tree'];
    }

    return (
      <div className={treeClass} style={maybeHide}>
        {tab}

        <ul className={this.props.styles.entries}>
          {folders}
          {files}
        </ul>
      </div>
    );
  }
}

FileTree.defaultProps = {
  depth: 0,
  isRoot: false,
};

FileTree.propTypes = {
  depth: React.PropTypes.number,
  downloadName: React.PropTypes.string.isRequired,
  files: React.PropTypes.arrayOf(React.PropTypes.shape(File.propTypes)),
  initialCollapse: React.PropTypes.bool,
  isEnabled: React.PropTypes.bool,
  isMultiFile: React.PropTypes.bool.isRequired,
  isRoot: React.PropTypes.bool,
  name: React.PropTypes.string,
  styles: React.PropTypes.object,
};

export default CSSModules(FileTree, styles);
