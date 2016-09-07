import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  Checkbox,
  FormControl,
  InputGroup,
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import request from 'superagent';
import Cookies from 'js-cookie';

import styles from './upload.module.less';

class MagnetURI extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setInputRef = this.setInputRef.bind(this);
    this.setCheckboxRef = this.setCheckboxRef.bind(this);
    this.handleSubmitMagnet = this.handleSubmitMagnet.bind(this);
  }

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
      });
  }

  setInputRef(ref) {
    this.uriInput = ReactDOM.findDOMNode(ref);
  }

  setCheckboxRef(ref) {
    this.startCheckbox = ref;
  }

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
  }
}

export default CSSModules(MagnetURI, styles);
