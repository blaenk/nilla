import React from 'react';
import CSSModules from 'react-css-modules';
import moment from 'moment';

import styles from './header.module.less';

const Header = React.createClass({
  propTypes: {
    infohash: React.PropTypes.string.isRequired,
    dateAdded: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    state: React.PropTypes.string.isRequired,
    progress: React.PropTypes.number.isRequired,
    uploader: React.PropTypes.string.isRequired,
    locks: React.PropTypes.array.isRequired
  },

  render: function() {
    const dateAdded = new moment(this.props.dateAdded).utc().local();
    const dateAddedShortFormat = dateAdded.clone().format("l");
    const dateAddedLongFormat = dateAdded.clone()
                                   .format("dddd, MMMM Do YYYY [at] h:mm:ss A");

    const expiresDate = dateAdded.clone().add(2, "weeks");
    const expiresShortFormat = expiresDate.clone().fromNow();
    const expiresLongFormat = expiresDate.clone()
                                   .format("dddd, MMMM Do YYYY [at] h:mm:ss A");

    let expiresOrLocks;

    if (this.props.locks.length) {
      const lockedBy = this.props.locks.join(', ');

      expiresOrLocks = <span className="locks">and locked by {lockedBy}</span>;
    } else {
      expiresOrLocks = (
        <span className="expiresAt">
          and expires
          {' '}
          <time title={expiresLongFormat}>{expiresShortFormat}</time>
        </span>
      );
    }

    return (
      <div>
        <div styleName='header'>
          {/* Insert &#8203; before dots so long names wrap */}
          <h4 styleName='name'>
            {this.props.name}
          </h4>

          <div styleName='progress'>
            <div styleName={`progress-${this.props.state}`}
                 style={{width: "75%"}}
                 aria-valuenow="75">
            </div>
          </div>

          <div styleName="meta">
            <div styleName="date-added">
              added by <strong>{this.props.uploader}</strong> on
              {' '}
              <time title={dateAddedLongFormat}>
                {dateAddedShortFormat}
              </time>
              {' '}
              {expiresOrLocks}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default CSSModules(Header, styles);
