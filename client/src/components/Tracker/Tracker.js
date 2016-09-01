import React from 'react';
import {
  Button,
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import { LinkContainer } from 'react-router-bootstrap';

import { getTrackers } from 'actions';

import styles from 'styles/app.module.less';

class Tracker extends React.Component {
  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(getTrackers());
  }

  shouldComponentUpdate() {
    return true;
  }


  render() {
    if (!this.props.tracker) {
      return null;
    }

    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Name
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Name'
                         defaultValue={this.props.tracker.name} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            URL
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='URL'
                         defaultValue={this.props.tracker.url} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Description
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Description'
                         defaultValue={this.props.tracker.category} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Username
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Username'
                         defaultValue={this.props.tracker.username} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Password
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Password'
                         defaultValue={this.props.tracker.password} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col smOffset={2} sm={2}>
            <LinkContainer to='/trackers'>
              <Button bsStyle='danger'>
                cancel
              </Button>
            </LinkContainer>
          </Col>

          <Col sm={2} className='pull-right'>
            <Button type='submit' className='pull-right' bsStyle='primary'>
              submit
            </Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}

Tracker.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  tracker: React.PropTypes.object.isRequired,
};

export default CSSModules(Tracker, styles);
