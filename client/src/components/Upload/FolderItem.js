import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import FileItem from './FileItem';

import styles from './upload.module.less';

import { partitionFiles } from 'common';

class FolderItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isCollapsed: true,
    };

    this.handleCollapse = this.handleCollapse.bind(this);
  }

  handleCollapse() {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  }

  render() {
    const { folders, files } = partitionFiles(this.props.files, this.props.depth);

    const folderItems = folders.map(folder => {
      return (
        <FolderItem key={folder.name}
                    name={folder.name}
                    files={folder.files}
                    depth={this.props.depth + 1}
                    styles={this.props.styles} />
      );
    });

    const fileItems = files.map(f => {
      return (
        <FileItem key={f.path} pathComponents={f.pathComponents} size={f.length} />
      );
    });

    let inner;

    if (this.props.isRoot || !this.state.isCollapsed) {
      inner = (
        <ul className={this.props.styles[this.props.isRoot ? 'root-folder' : null]}>
          {folderItems}
          {fileItems}
        </ul>
      );
    }

    if (this.props.isRoot) {
      return inner;
    }

    return (
      <div>
        <div className={this.props.styles['folder-tab']} onClick={this.handleCollapse}>
          <Glyphicon className={this.props.styles['collapse-mark']}
                     glyph={this.state.isCollapsed ? 'chevron-down' : 'chevron-up'} />
          <strong>{this.props.name}</strong>
        </div>

        {inner}
      </div>
    );
  }
}

FolderItem.propTypes = {
  depth: PropTypes.number,
  files: PropTypes.array,
  isRoot: PropTypes.bool,
  name: PropTypes.string,
  styles: PropTypes.object,
};

export default CSSModules(FolderItem, styles);
