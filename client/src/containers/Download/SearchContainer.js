import { connect } from 'react-redux';

import Search from 'components/Download/Search';

import { setDownloadFilter, setDownloadGlobalCollapse } from 'actions';

function mapStateToProps(state, props) {
  const { infoHash } = props;

  // TODO
  // dispatch(initDownload(infoHash))?

  if (infoHash in state.ui.downloads) {
    const {
      filter,
      isCollapsed,
    } = state.ui.downloads[infoHash];

    return { filter, isCollapsed };
  }

  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onChangeFilter(event) {
      dispatch(setDownloadFilter(ownProps.infoHash, event.target.value));
    },
    collapse(infoHash, isCollapsed) {
      dispatch(setDownloadGlobalCollapse(infoHash, isCollapsed));
    },
  };
}

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer;
