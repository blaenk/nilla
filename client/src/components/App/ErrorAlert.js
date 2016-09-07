import React from 'react';
import { Col, Row } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import styles from './error.module.less';

class ErrorAlert extends React.PureComponent {
  render() {
    return (
      <Row>
        <Col lg={12}>
          <div styleName='error-alert'>
            <div styleName='error-header'>
              <button type='button'
                      styleName='error-close'
                      onClick={this.props.onDismiss}
                      aria-hidden='true'
                      tabIndex='-1'>
                <span>&times;</span>
              </button>
              <h4 styleName='error-title'>{this.props.title}</h4>
            </div>
            <div styleName='error-body'>
              {this.props.children}
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

ErrorAlert.propTypes = {
  children: React.PropTypes.node.isRequired,
  onDismiss: React.PropTypes.func.isRequired,
  title: React.PropTypes.string.isRequired,
};

export default CSSModules(ErrorAlert, styles);
