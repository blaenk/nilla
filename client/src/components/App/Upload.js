import React from 'react';
import {
  Button,
  Checkbox,
  Col,
  FormControl,
  InputGroup,
  Row
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import styles from './upload.module.less';

const Upload = React.createClass({
  propTypes: {
    onSubmitMagnet: React.PropTypes.func.isRequired,
    onClickFiles: React.PropTypes.func.isRequired,
    onClickUpload: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div>
        <Row styleName='upload'>
          <Col lg={12}>
            <InputGroup>
              <FormControl type='text'
                           placeholder='Magnet URI'
                           autoFocus={true}
                           styleName='magnet-uri' />

              <InputGroup.Addon>
                <Checkbox inline>start</Checkbox>
              </InputGroup.Addon>

              <InputGroup.Button>
                <Button onClick={this.props.onSubmitMagnet}>submit</Button>
              </InputGroup.Button>
            </InputGroup>
          </Col>
        </Row>

        <Row styleName='buttons'>
          <Col lg={12}>
            <Button onClick={this.props.onClickFiles}>files</Button>
            <Button onClick={this.props.onClickUpload}>upload all</Button>
          </Col>
        </Row>
      </div>
    );
  }
});

export default CSSModules(Upload, styles);
