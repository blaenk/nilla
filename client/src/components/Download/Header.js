import React from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import moment from 'moment';

import styles from './header.module.less';

import { expiresAt } from 'common';

function Header(props) {
  const LONG_DATE_FORMAT = 'dddd, MMMM Do YYYY [at] h:mm:ss A';

  const dateAdded = moment(props.download.dateAdded).utc().local();
  const dateAddedShortFormat = moment(dateAdded).format('l');
  const dateAddedLongFormat = moment(dateAdded).format(LONG_DATE_FORMAT);

  const expiresDate = expiresAt(props.download);
  const expiresShortFormat = moment(expiresDate).fromNow();
  const expiresLongFormat = moment(expiresDate).format(LONG_DATE_FORMAT);

  let expiresOrLocks;

  if (props.download.locks.length) {
    const lockedBy = props.download.locks.filter(id => id in props.users)
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

  const wrappedName = props.download.name.replace(/\./g, '\u200b.');

  let uploaderName;

  if (props.download.uploader === -1) {
    uploaderName = 'system';
  } else {
    const uploader = props.users[props.download.uploader];

    uploaderName = uploader && uploader.username;
  }

  return (
    <div>
      <div styleName='header'>
        <h4 styleName='name'>
          {wrappedName}
        </h4>

        <div styleName='progress'>
          <div styleName={`progress-${props.download.state}`}
               style={{ width: `${props.download.progress}%` }}
               aria-valuenow={props.download.progress} />
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
  download: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
};

export default CSSModules(Header, styles);
