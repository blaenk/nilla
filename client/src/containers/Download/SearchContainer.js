import { connect } from 'react-redux';

import Search from 'components/Download/Search';

import { setDownloadFilter, setDownloadGlobalCollapse } from 'actions';

function mapStateToProps(state, props) {
  const { infoHash } = props;

  if (infoHash in state.ui.download) {
    const {
      filter,
      isCollapsed,
    } = state.ui.download[infoHash];

    const containsFolder = file => {
      return file.pathComponents.length > 1;
    };

    const containsFolders =
          state.data.downloads[infoHash].files.downloaded.some(containsFolder) ||
          state.data.downloads[infoHash].files.extracted.some(containsFolder);

    return { filter, isCollapsed, containsFolders };
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
