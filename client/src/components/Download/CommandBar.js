import React from 'react';
import CSSModules from 'react-css-modules';
import {
  Button,
  ButtonGroup,
  Glyphicon,
} from 'react-bootstrap';

import styles from './download.module.less';

function CommandBar(props) {
  return (
    <ButtonGroup styleName='command-bar'>
      <Button bsSize='xsmall'
              styleName='command-button'
              onClick={() => console.log('stop')}>
        <Glyphicon glyph={true ? 'pause' : 'play'} />
      </Button>

      <Button bsSize='xsmall'
              styleName='command-button'
              onClick={() => console.log('lock')}>
        <Glyphicon glyph='lock' />
      </Button>

      <Button bsSize='xsmall'
              styleName='command-button'
              onClick={() => console.log('edit files')}>
        <Glyphicon glyph='cog' />
      </Button>

      <Button bsSize='xsmall'
              styleName='command-button'
              onClick={() => console.log('stats')}>
        <Glyphicon glyph='stats' />
      </Button>

      <Button bsSize='xsmall'
              styleName='command-button'
              onClick={() => console.log('remove')}>
        <Glyphicon glyph='remove' />
      </Button>
    </ButtonGroup>
  );
}

export default CSSModules(CommandBar, styles);
