import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  Checkbox,
  FormControl,
  InputGroup,
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import styles from './upload.module.less';
import request from 'superagent';

import Cookies from 'js-cookie';

const MagnetURI = React.createClass({
  handleSubmitMagnet() {
    request.post('/api/downloads')
      .type('json')
      .set('X-CSRF-TOKEN', Cookies.get('csrf-token'))
      .send({
        uri: this.uriInput.value,
        start: this.startCheckbox.checked,
      })
      .then(_json => {
        this.uriInput.value = '';
        this.startCheckbox.checked = true;
      })
      .catch(error => {
        throw error;
      });
  },

  setInputRef(ref) {
    this.uriInput = ReactDOM.findDOMNode(ref);
  },

  setCheckboxRef(ref) {
    this.startCheckbox = ref;
  },

  render() {
    return (
      <InputGroup>
        <FormControl type='text'
                     ref={this.setInputRef}
                     placeholder='Magnet URI'
                     autoFocus
                     styleName='magnet-uri' />

        <InputGroup.Addon styleName='start-magnet'>
          <Checkbox inline
                    defaultChecked
                    styleName='start-magnet'
                    inputRef={this.setCheckboxRef}>
            start
          </Checkbox>
        </InputGroup.Addon>

        <InputGroup.Button>
          <Button bsStyle='success' styleName='button' onClick={this.handleSubmitMagnet}>
            submit
          </Button>
        </InputGroup.Button>
      </InputGroup>
    );
  },
});

export default CSSModules(MagnetURI, styles);
