import { connect } from 'react-redux';

import { Collapse } from 'react-bootstrap';

function mapStateToProps(state) {
  return {
    in: state.ui.upload.isUploading,
  };
}

const CollapseContainer = connect(
  mapStateToProps
)(Collapse);

export default CollapseContainer;
