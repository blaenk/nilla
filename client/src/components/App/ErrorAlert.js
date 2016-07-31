import React from 'react';
import { Col, Row } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import styles from './error.module.less';

const ErrorAlert = (props) => {
  return (
    <Row>
      <Col lg={12}>
        <div styleName='error-alert'>
          <div styleName='error-header'>
            <button type='button'
                    styleName='error-close'
                    onClick={props.onDismiss}
                    aria-hidden='true'
                    tabIndex='-1'>
              <span>&times;</span>
            </button>
            <h4 styleName='error-title'>{props.title}</h4>
          </div>
          <div styleName='error-body'>
            {props.children}
          </div>
        </div>
      </Col>
    </Row>
  );
};

ErrorAlert.propTypes = {
  title: React.PropTypes.string.isRequired,
  onDismiss: React.PropTypes.func.isRequired,
  children: React.PropTypes.node.isRequired,
};

export default CSSModules(ErrorAlert, styles);
