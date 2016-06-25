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
    progress: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    locks: React.PropTypes.array.isRequired
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

    return (
      <li styleName="download">
        <OverlayTrigger placement="right" overlay={progressTooltip}>
          <div styleName='progress'>
            <div styleName={`progress-${this.props.state}`}
                 style={{height: this.props.progress + "%"}}
                 aria-valuenow={this.props.progress}>
            </div>
          </div>
        </OverlayTrigger>
        <Link to={`/download/${this.props.infohash}`} styleName='name'>
          {this.props.name}
        </Link>
        {lockStatus()}
      </li>
    );
  }
});

export default CSSModules(Download, styles);
