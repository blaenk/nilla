import React from 'react';
import { Link } from 'react-router';
import CSSModules from 'react-css-modules';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import styles from './styles.module.less';

let Download = React.createClass({
  propTypes: {
    infohash: React.PropTypes.string.isRequired,
    state: React.PropTypes.oneOf([
      'seeding',
      'closed',
      'downloading',
      'hashing',
      'stopped'
    ]).isRequired,
    progress: React.PropTypes.number.isRequired,
    name: React.PropTypes.string.isRequired,
    locks: React.PropTypes.array.isRequired,
    isHidden: React.PropTypes.bool.isRequired
  },

  render: function() {
    const lockedTooltip = (
      <Tooltip id="tooltip_locked">locked</Tooltip>
    );

    const progressTooltip = (
      <Tooltip id="tooltip_state">{this.props.state}</Tooltip>
    );

    const lockStatus = () => {
      if (this.props.locks.length) {
        return (
          <OverlayTrigger placement="left" overlay={lockedTooltip}>
            <div styleName="lock-status" />
          </OverlayTrigger>
        );
      } else { return null; }
    };

    let maybeHide = this.props.isHidden ? {display: 'none'} : {};

    return (
      <li styleName="download" style={maybeHide}>
        <OverlayTrigger placement="right" overlay={progressTooltip}>
          <div styleName='progress'>
            <div styleName={`progress-${this.props.state}`}
                 style={{height: this.props.progress + "%"}}
                 aria-valuenow={this.props.progress}>
            </div>
          </div>
        </OverlayTrigger>
        <Link to={`/downloads/${this.props.infohash}/${this.props.name}`} styleName='name'>
          {this.props.name}
        </Link>
        {lockStatus()}
      </li>
    );
  }
});

export default CSSModules(Download, styles);
