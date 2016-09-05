import React from 'react';

import ErrorAlert from './ErrorAlert';

// TODO
// use static-container
function RtorrentUnavailableErrorAlert(props) {
  if (!props.isRtorrentAvailable) {
    return (
      <ErrorAlert title='RTorrent Unavailable!' onDismiss={props.onDismiss}>
        <p>
          RTorrent is currently unavailable. Contact the administrator.
        </p>
      </ErrorAlert>
    );
  }

  return null;
}

RtorrentUnavailableErrorAlert.propTypes = {
  isRtorrentAvailable: React.PropTypes.bool.isRequired,
  onDismiss: React.PropTypes.func.isRequired,
};

export default RtorrentUnavailableErrorAlert;
