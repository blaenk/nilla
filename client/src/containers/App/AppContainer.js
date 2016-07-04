import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Router, Route, Redirect} from 'react-router';
import CSSModules from 'react-css-modules';

import { Provider } from 'react-redux';

import { addFile } from 'actions';

import FilteredDownloads from 'containers/Downloads/FilteredDownloads';
import DownloadContainer from 'containers/Download/DownloadContainer';
import App from 'components/App/App';

import styles from 'styles/app.module.less';

const mapStateToProps = (state) => {
  return {
    files: state.upload.files
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onDropAccepted: function(files) {
      for (const file of files) {
        dispatch(addFile(file));
      }
    }
  };
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

const AppContainer_ = React.createClass({
  propTypes: {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  },

  render: function() {
    return (
      <Provider store={this.props.store}>
        <Router history={this.props.history}>
          <Redirect from="/" to="/downloads" />

          <Route path="/" component={AppContainer}>
            <Route path="downloads" component={FilteredDownloads} />
            <Route path="download/:infohash" component={DownloadContainer} />
          </Route>
        </Router>
      </Provider>
    );
  }
});

export default CSSModules(AppContainer_, styles);
