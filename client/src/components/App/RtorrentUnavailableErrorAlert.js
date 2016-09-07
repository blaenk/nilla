import React from 'react';

import ErrorAlert from './ErrorAlert';

class RtorrentUnavailableErrorAlert extends React.PureComponent {
  render() {
    if (!this.props.isRtorrentAvailable) {
      return (
        <ErrorAlert title='RTorrent Unavailable!'>
          <p>RTorrent is currently unavailable. Contact the administrator.</p>
        </ErrorAlert>
      );
    }

    return null;
  }
}

RtorrentUnavailableErrorAlert.propTypes = {
  isRtorrentAvailable: React.PropTypes.bool.isRequired,
};

export default RtorrentUnavailableErrorAlert;
