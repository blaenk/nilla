import React from 'react';
import CSSModules from 'react-css-modules';

import FileTree from './FileTree';

import styles from './download.module.less';

function FilesSection(props) {
  const fileCount = props.files.length;

  if (props.files.length === 0 || fileCount === 0) {
    return null;
  }

  let sectionLabel = null;

  if (props.showLabelIf) {
    sectionLabel = (
      <p styleName='section-label'>{props.label} ({fileCount})</p>
    );
  }

  return (
    <div styleName='files'>
      {sectionLabel}
      <FileTree isRoot
                isEditing={props.isEditing}
                isMultiFile={props.isMultiFile}
                depth={props.depth}
                initialCollapse={props.initialCollapse}
                downloadName={props.downloadName}
                files={props.files} />
    </div>
  );
}

FilesSection.defaultProps = {
  depth: 0,
  showLabelIf: true,
};

FilesSection.propTypes = {
  depth: React.PropTypes.number.isRequired,
  downloadName: React.PropTypes.string.isRequired,
  files: React.PropTypes.array.isRequired,
  initialCollapse: React.PropTypes.bool.isRequired,
  isMultiFile: React.PropTypes.bool.isRequired,
  label: React.PropTypes.string.isRequired,
  showLabelIf: React.PropTypes.bool.isRequired,
  visibleCount: React.PropTypes.bool.isRequired,
};

export default CSSModules(FilesSection, styles);
