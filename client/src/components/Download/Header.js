import React from 'react';
import CSSModules from 'react-css-modules';
import moment from 'moment';

import styles from './header.module.less';

import { EXPIRATION_DURATION } from 'common';

const Header = (props) => {
  const dateAdded = moment(props.dateAdded).utc().local();
  const dateAddedShortFormat = dateAdded.clone().format('l');
  const dateAddedLongFormat = dateAdded.clone().format('dddd, MMMM Do YYYY [at] h:mm:ss A');

  const expiresDate = dateAdded.clone().add(EXPIRATION_DURATION);
  const expiresShortFormat = expiresDate.clone().fromNow();
  const expiresLongFormat = expiresDate.clone().format('dddd, MMMM Do YYYY [at] h:mm:ss A');

  let expiresOrLocks;

  if (props.locks.length) {
    const lockedBy = props.locks.join(', ');

    expiresOrLocks = <span className='locks'>and locked by {lockedBy}</span>;
  } else {
    expiresOrLocks = (
      <span className='expiresAt'>
        and expires
        {' '}
        <time title={expiresLongFormat}>{expiresShortFormat}</time>
      </span>
    );
  }

  const wrappedName = props.name.replace(/\./g, '&#8203');

  return (
    <div>
      <div styleName='header'>
        <h4 styleName='name'>
          {wrappedName}
        </h4>

        <div styleName='progress'>
          <div styleName={`progress-${props.state}`}
               style={{ width: `${props.progress}%` }}
               aria-valuenow={props.progress}>
          </div>
        </div>

        <div styleName='meta'>
          <div styleName='date-added'>
            added by <strong>{props.uploader}</strong> on
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
};

Header.propTypes = {
  infoHash: React.PropTypes.string.isRequired,
  dateAdded: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  state: React.PropTypes.string.isRequired,
  progress: React.PropTypes.number.isRequired,
  uploader: React.PropTypes.string.isRequired,
  locks: React.PropTypes.array.isRequired,
};

export default CSSModules(Header, styles);
