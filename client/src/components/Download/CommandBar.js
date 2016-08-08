import React from 'react';
import { withRouter } from 'react-router';
import CSSModules from 'react-css-modules';
import {
  Button,
  ButtonGroup,
  Glyphicon,
} from 'react-bootstrap';

import styles from './download.module.less';

class CommandBar extends React.Component {
  constructor(props) {
    super(props);

    this._erase = this._erase.bind(this);
  }

  _erase() {
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
    const isLocked = this.props.download.locks.includes(this.props.user.id);

    return (
      <ButtonGroup styleName='command-bar'>
        <Button bsSize='xsmall'
                styleName='command-button'
                title={isDownloading ? 'pause' : 'play'}
                onClick={isDownloading ? this.props.stop : this.props.start}>
          <Glyphicon glyph={isDownloading ? 'pause' : 'play'} />
        </Button>

        <Button bsSize='xsmall'
                styleName='command-button'
                onClick={isLocked ? this.props.unlock : this.props.lock}>
          <Glyphicon glyph={isLocked ? 'link' : 'lock'} />
        </Button>

        <Button bsSize='xsmall'
                styleName='command-button'
                onClick={this.props.edit}>
          <Glyphicon glyph='cog' />
        </Button>

        <Button bsSize='xsmall'
                styleName='command-button'
                onClick={this.props.stats}>
          <Glyphicon glyph='stats' />
        </Button>

        <Button bsSize='xsmall'
                styleName='command-button'
                onClick={this._erase}>
          <Glyphicon glyph='remove' />
        </Button>
      </ButtonGroup>
    );
  }
}

export default withRouter(CSSModules(CommandBar, styles));
