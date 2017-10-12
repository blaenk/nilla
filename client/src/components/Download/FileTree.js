import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Glyphicon, Checkbox } from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import { partitionFiles } from 'common';

import FileContainer from 'containers/Download/FileContainer';
import FileTreeContainer from 'containers/Download/FileTreeContainer';

import styles from './filetree.module.less';

class FileTree extends React.Component {
  constructor(props) {
    super(props);

    // TODO
    // move this to redux
    // perhaps use data-based rendering instead, as in react-treebeard
    this.state = {
      isCollapsed: this.props.initialCollapse,
    };

    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleToggleContained = this.handleToggleContained.bind(this);

    this._files = this._folders = [];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.initialCollapse !== nextProps.initialCollapse) {
      this.setState({ isCollapsed: nextProps.initialCollapse });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.files !== nextProps.files ||
      this.state.isCollapsed !== nextState.isCollapsed ||
      this.props.initialCollapse !== nextProps.initialCollapse ||
      this.props.isEditing !== nextProps.isEditing;
  }

  handleTabClick(_event) {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  }

  handleToggleContained(event) {
    event.stopPropagation();

    if (event.target.checked) {
      for (const file of this._files) {
        this.props.enable(file.id);
      }
    } else {
      for (const file of this._files) {
        this.props.disable(file.id);
      }
    }
  }

  render() {
    const fileCount = this.props.files.length;

    const maybeHide = (fileCount > 0) ? {} : { display: 'none' };

    // TODO
    // move this computation to willReceiveProps if it's different
    let { folders, files } = partitionFiles(this.props.files, this.props.depth);

    this._folders = folders;
    this._files = files;

    folders = folders.sort((a, b) => {
      return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
    });

    folders = folders.map(folder => {
      return (
        <FileTreeContainer name={folder.name}
                           key={folder.name}
                           infoHash={this.props.infoHash}
                           isEditing={this.props.isEditing}
                           styles={this.props.styles}
                           depth={this.props.depth + 1}
                           initialCollapse={this.props.initialCollapse}
                           isCrossSeeding={this.props.isCrossSeeding}
                           isMultiFile={this.props.isMultiFile}
                           directory={this.props.directory}
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
        <FileContainer size={file.size}
                       infoHash={this.props.infoHash}
                       isEditing={this.props.isEditing}
                       styles={this.props.styles}
                       isCrossSeeding={this.props.isCrossSeeding}
                       isMultiFile={this.props.isMultiFile}
                       directory={this.props.directory}
                       progress={file.progress}
                       isEnabled={file.isEnabled}
                       pathComponents={file.pathComponents}
                       id={file.id}
                       key={key} />
      );
    });

    let checkbox;

    if (this.props.isEditing) {
      const allEnabled =
            this._files.map(f => f.id)
              .every(id => this.props.ui.filePriorities[id]);

      checkbox = (
        <Checkbox inline defaultChecked={allEnabled} onClick={this.handleToggleContained} />
      );
    }

    let tab;

    if (!this.props.isRoot) {
      tab = (
        <div className={this.props.styles['folder-tab']} onClick={this.handleTabClick}>
          {checkbox}

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

      if (this.state.isCollapsed) {
        return (
          <div className={this.props.styles['file-tree']} style={maybeHide}>
            {tab}
          </div>
        );
      }
    }

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
  depth: PropTypes.number,
  directory: PropTypes.string.isRequired,
  disable: PropTypes.func.isRequired,
  enable: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired,
  infoHash: PropTypes.string.isRequired,
  initialCollapse: PropTypes.bool,
  isCrossSeeding: PropTypes.bool,
  isEditing: PropTypes.bool,
  isEnabled: PropTypes.bool,
  isMultiFile: PropTypes.bool.isRequired,
  isRoot: PropTypes.bool,
  name: PropTypes.string,
  styles: PropTypes.object,
  ui: PropTypes.object.isRequired,
};

export default CSSModules(FileTree, styles);
