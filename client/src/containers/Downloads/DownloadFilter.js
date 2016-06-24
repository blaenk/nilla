import React from 'react';
import { connect } from 'react-redux';
import { FormControl } from 'react-bootstrap';

import { setFilter } from 'actions';

const DownloadFilter_ = (props) => {
  return (
    <FormControl type='text' placeholder='Search' onChange={props.onChange} />
  );
};

DownloadFilter_.propTypes = {
  onChange: React.PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    filter: state.search.filter
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChange: (event) => {
      dispatch(setFilter(event.target.value));
    }
  };
};

const DownloadFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(DownloadFilter_);

export default DownloadFilter;
