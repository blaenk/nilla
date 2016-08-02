import { connect } from 'react-redux';

import Search from 'components/Download/Search';

import { setDownloadFilter } from 'actions';

const mapStateToProps = (state, props) => {
  const { infoHash } = props;

  let filter = '';

  if (infoHash in state.ui.downloads) {
    filter = state.ui.downloads[infoHash].filter;
  }

  return {
    filter,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChangeFilter(event) {
      dispatch(setDownloadFilter(ownProps.infoHash, event.target.value));
    },
  };
};

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer;
