import React from 'react';
import { Link } from 'react-router';
import CSSModules from 'react-css-modules';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import styles from './styles.module.less';

const Download = (props) => {
  const lockedTooltip = (
    <Tooltip id='tooltip_locked'>locked</Tooltip>
  );

  const progressTooltip = (
    <Tooltip id='tooltip_state'>{props.state}</Tooltip>
  );

  const lockStatus = () => {
    if (props.locks.length) {
      return (
        <OverlayTrigger placement='left' overlay={lockedTooltip}>
          <div styleName='lock-status' />
        </OverlayTrigger>
      );
    }

    return null;
  };

  let maybeHide = props.isHidden ? { display: 'none' } : {};

  return (
    <li styleName='download' style={maybeHide}>
      <OverlayTrigger placement='right' overlay={progressTooltip}>
        <div styleName='progress'>
          <div styleName={`progress-${props.state}`}
               style={{ height: props.progress + '%' }}
               aria-valuenow={props.progress}>
          </div>
        </div>
      </OverlayTrigger>
      <Link to={`/downloads/${props.infoHash}/${props.name}`} styleName='name'>
        {props.name}
      </Link>
      {lockStatus()}
    </li>
  );
};

Download.propTypes = {
  infoHash: React.PropTypes.string.isRequired,
  isHidden: React.PropTypes.bool.isRequired,
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
};

export default CSSModules(Download, styles);
