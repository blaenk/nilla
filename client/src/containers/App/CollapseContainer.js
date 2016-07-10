import { connect } from 'react-redux';

import { Collapse } from 'react-bootstrap';

const mapStateToProps = (state) => {
  return {
    in: state.upload.isUploading
  };
};

const CollapseContainer = connect(
  mapStateToProps
)(Collapse);

export default CollapseContainer;
