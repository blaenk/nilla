import React from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';

import FileTreeContainer from 'containers/Download/FileTreeContainer';

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
      <FileTreeContainer isRoot
                         infoHash={props.infoHash}
                         isCrossSeeding={props.isCrossSeeding}
                         isEditing={props.isEditing}
                         isMultiFile={props.isMultiFile}
                         depth={props.depth}
                         initialCollapse={props.initialCollapse}
                         directory={props.directory}
                         files={props.files} />
    </div>
  );
}

FilesSection.defaultProps = {
  depth: 0,
  showLabelIf: true,
};

FilesSection.propTypes = {
  depth: PropTypes.number.isRequired,
  directory: PropTypes.string.isRequired,
  files: PropTypes.array.isRequired,
  infoHash: PropTypes.string.isRequired,
  initialCollapse: PropTypes.bool.isRequired,
  isCrossSeeding: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isMultiFile: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  showLabelIf: PropTypes.bool.isRequired,
  visibleCount: PropTypes.bool.isRequired,
};

export default CSSModules(FilesSection, styles);
