import React from 'react';
import CSSModules from 'react-css-modules';
import moment from 'moment';

import styles from './header.module.less';

import { expiresAt } from 'common';

function Header(props) {
  const LONG_DATE_FORMAT = 'dddd, MMMM Do YYYY [at] h:mm:ss A';

  const dateAdded = moment(props.dateAdded).utc().local();
  const dateAddedShortFormat = moment(dateAdded).format('l');
  const dateAddedLongFormat = moment(dateAdded).format(LONG_DATE_FORMAT);

  const expiresDate = expiresAt(dateAdded);
  const expiresShortFormat = moment(expiresDate).fromNow();
  const expiresLongFormat = moment(expiresDate).format(LONG_DATE_FORMAT);

  let expiresOrLocks;

  if (props.locks.length) {
    const lockedBy = props.locks.filter(id => id in props.users)
      .map(id => props.users[id].username)
      .join(', ');

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

  const wrappedName = props.name.replace(/\./g, '\u200b.');

  let uploaderName;

  if (props.uploader === -1) {
    uploaderName = 'system';
  } else {
    uploaderName = props.users[props.uploader] && props.users[props.uploader].username;
  }

  return (
    <div>
      <div styleName='header'>
        <h4 styleName='name'>
          {wrappedName}
        </h4>

        <div styleName='progress'>
          <div styleName={`progress-${props.state}`}
               style={{ width: `${props.progress}%` }}
               aria-valuenow={props.progress} />
        </div>

        <div styleName='meta'>
          added by <strong>{uploaderName}</strong> on
          {' '}
          <time title={dateAddedLongFormat}>
            {dateAddedShortFormat}
          </time>
          {' '}
          {expiresOrLocks}
        </div>
      </div>
    </div>
  );
}

Header.propTypes = {
  dateAdded: React.PropTypes.string.isRequired,
  infoHash: React.PropTypes.string.isRequired,
  locks: React.PropTypes.array.isRequired,
  name: React.PropTypes.string.isRequired,
  progress: React.PropTypes.number.isRequired,
  state: React.PropTypes.string.isRequired,
  uploader: React.PropTypes.string.isRequired,
  users: React.PropTypes.array.isRequired,
};

export default CSSModules(Header, styles);
