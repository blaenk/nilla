import React from 'react';
import { Grid } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { Route, Switch, Redirect } from 'react-router';

import HeaderContainer from 'containers/App/HeaderContainer';
import RtorrentUnavailableErrorContainer from 'containers/App/RtorrentUnavailableErrorContainer';
import CollapseContainer from 'containers/Upload/CollapseContainer';
import UploadContainer from 'containers/Upload/UploadContainer';
import DropzoneContainer from 'containers/Upload/DropzoneContainer';

import FilteredDownloads from 'containers/Downloads/FilteredDownloads';
import DownloadContainer from 'containers/Download/DownloadContainer';

import UsersContainer from 'containers/Users/UsersContainer';
import EditUserContainer from 'containers/User/EditUserContainer';

import TrackersContainer from 'containers/Trackers/TrackersContainer';
import EditTrackerContainer from 'containers/Tracker/EditTrackerContainer';
import NewTrackerContainer from 'containers/Tracker/NewTrackerContainer';

import styles from 'styles/app.module.less';

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setDropzoneRef = this.setDropzoneRef.bind(this);
    this.handleOpenFileDialog = this.handleOpenFileDialog.bind(this);
  }

  setDropzoneRef(ref) {
    this.dropzoneRef = ref;
  }

  handleOpenFileDialog() {
    this.dropzoneRef.getWrappedInstance().open();
  }

  render() {
    return (
      <DropzoneContainer
        style={{}}
        disableClick
        ref={this.setDropzoneRef}>
        <Grid>
          <HeaderContainer location={this.props.location} />

          <RtorrentUnavailableErrorContainer />

          <CollapseContainer>
            <div>
              <UploadContainer onClickFiles={this.handleOpenFileDialog} />
            </div>
          </CollapseContainer>

          <Switch>
            <Redirect exact from='/' to='/downloads' />

            <Route path='/downloads/:infoHash(/:name)' component={DownloadContainer} />
            <Route exact path='/downloads' component={FilteredDownloads} />

            <Route exact path='/users' component={UsersContainer} />
            <Route path='/users/:id' component={EditUserContainer} />

            <Route exact path='/trackers' component={TrackersContainer} />
            <Route exact path='/trackers/new' component={NewTrackerContainer} />
            <Route path='/trackers/:id' component={EditTrackerContainer} />
          </Switch>
        </Grid>
      </DropzoneContainer>
    );
  }
}

App.propTypes = {
  location: PropTypes.object,
};

export default CSSModules(App, styles);
