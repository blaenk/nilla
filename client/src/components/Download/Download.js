import React from 'react';
import CSSModules from 'react-css-modules';

import styles from './styles.module.css';

const ExpiresOrLocks = React.createClass({
  propTypes: {
    locks: React.PropTypes.Array.isRequired
  },

  render: function() {
    if (this.props.locks) {
      return (
        <span className="expiresAt">and expires in</span>
      );
    } else {
      return (
        <span className="locks">and locked by</span>
      );
    }
  }
});

const Download = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    uploader: React.PropTypes.string.isRequired,
    locks: React.PropTypes.array.isRequired
  },
  render: function() {
    return (
      <div>
        <div className={styles.header}>
          <h4 className={styles.name}>
            {this.props.name}
          </h4>

          <div className={styles.progress}
               dataToggle="tooltip"
               dataOriginalTitle={this.state}
               dataPlacement="top">
            <div className={styles["state-" + this.state]}
                 style={{width: "75%"}}
                 ariaValuenow="75">
            </div>
          </div>

          <div className="meta">
            <div className="added">
              added by {this.props.uploader} on
              <time className="date-added" title="some date [longfmt]">
                "some date [shortfmt]"
              </time>
              <ExpiresOrLocks locks={this.props.locks} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default CSSModules(Download, styles);
