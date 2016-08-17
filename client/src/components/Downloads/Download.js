import React from 'react';
import { Link } from 'react-router';
import CSSModules from 'react-css-modules';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import styles from './styles.module.less';

function Download(props) {
  const lockedTooltip = (
    <Tooltip id='tooltip_locked'>locked</Tooltip>
  );

  const progressTooltip = (
    <Tooltip id='tooltip_state'>{props.state}</Tooltip>
  );

  const lockStatus = () => {
    if (!props.user) {
      return null;
    }

    if (props.locks.includes(props.user.id)) {
      return (
        <OverlayTrigger placement='left' overlay={lockedTooltip}>
          <div styleName='lock-status' />
        </OverlayTrigger>
      );
    }

    return null;
  };

  let maybeHide = props.isHidden ? { display: 'none' } : {};

  let nameStyle = props.lastSeen < props.dateAdded ? 'unseen' : 'name';

  const encodedName = encodeURIComponent(props.name).replace(/%20/g, '+');

  return (
    <li styleName='download' style={maybeHide}>
      <OverlayTrigger placement='right' overlay={progressTooltip}>
        <div styleName='progress'>
          <div styleName={`progress-${props.state}`}
               style={{ height: props.progress + '%' }}
               aria-valuenow={props.progress} />
        </div>
      </OverlayTrigger>
      <Link to={`/downloads/${props.infoHash}/${encodedName}`} styleName={nameStyle}>
        {props.name}
      </Link>
      {lockStatus()}
    </li>
  );
}

Download.propTypes = {
  dateAdded: React.PropTypes.object.isRequired,
  infoHash: React.PropTypes.string.isRequired,
  isHidden: React.PropTypes.bool.isRequired,
  lastSeen: React.PropTypes.object.isRequired,
  locks: React.PropTypes.array.isRequired,
  name: React.PropTypes.string.isRequired,
  progress: React.PropTypes.number.isRequired,
  state: React.PropTypes.oneOf([
    'seeding',
    'closed',
    'downloading',
    'hashing',
    'stopped',
  ]).isRequired,
  user: React.PropTypes.object.isRequired,
};

export default CSSModules(Download, styles);
