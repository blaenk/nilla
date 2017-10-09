import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import CSSModules from 'react-css-modules';
import {
  Button,
  ButtonGroup,
  Glyphicon,
} from 'react-bootstrap';

import styles from './download.module.less';

import { userCan } from 'common';

class CommandBar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleErase = this.handleErase.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleStats = this.handleStats.bind(this);
  }

  handleStats() {
    this.props.stats(!this.props.ui.showStats);
  }

  handleEdit() {
    if (this.props.ui.isEditing) {
      this.props.cancelEdit();

      return;
    }

    const filePriorities = {};

    for (const file of this.props.download.files.downloaded) {
      filePriorities[file.id] = file.isEnabled;
    }

    this.props.edit(filePriorities);
  }

  handleErase() {
    if (confirm('are you sure you want to erase this?')) {
      this.props.erase(() => {
        this.props.router.push('/downloads');
      });
    }
  }

  render() {
    if (!this.props.user || !this.props.download) {
      return null;
    }

    const isDownloading = this.props.download.state === 'downloading';
    const isLocked = this.props.download.locks.length !== 0;
    const isLockedByCurrentUser = this.props.download.locks.includes(this.props.user.id);

    const currentUserIsUploader = this.props.user.id === this.props.download.uploader;
    const userCanControl = userCan(this.props.user, 'download:control');
    const canStartStop = this.props.user && (currentUserIsUploader || userCanControl);

    const stopStartButton = canStartStop ? (
      <Button bsSize='xsmall'
              styleName='command-button'
              title={isDownloading ? 'stop' : 'start'}
              onClick={isDownloading ? this.props.onStop : this.props.onStart}>
        <Glyphicon glyph={isDownloading ? 'pause' : 'play'} />
      </Button>
    ) : null;

    const canDelete = this.props.user && (userCanControl || (currentUserIsUploader && !isLocked));

    const deleteButton = canDelete ? (
      <Button bsSize='xsmall'
              styleName='command-button'
              title='delete'
              onClick={this.handleErase}>
        <Glyphicon glyph='remove' />
      </Button>
    ) : null;

    return (
      <ButtonGroup styleName='command-bar'>
        {stopStartButton}

        <Button bsSize='xsmall'
                styleName='command-button'
                title={isLockedByCurrentUser ? 'unlock' : 'lock'}
                onClick={isLockedByCurrentUser ? this.props.unlock : this.props.lock}>
          <Glyphicon glyph={isLockedByCurrentUser ? 'link' : 'lock'} />
        </Button>

        <Button bsSize='xsmall'
                styleName='command-button'
                title='enable/disable files'
                onClick={this.handleEdit}>
          <Glyphicon glyph='cog' />
        </Button>

        <Button bsSize='xsmall'
                styleName='command-button'
                title='show stats'
                onClick={this.handleStats}>
          <Glyphicon glyph='stats' />
        </Button>

        {deleteButton}
      </ButtonGroup>
    );
  }
}

CommandBar.propTypes = {
  cancelEdit: PropTypes.func.isRequired,
  download: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  erase: PropTypes.func.isRequired,
  lock: PropTypes.func.isRequired,
  onStart: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  stats: PropTypes.func.isRequired,
  ui: PropTypes.object.isRequired,
  unlock: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default withRouter(CSSModules(CommandBar, styles));
