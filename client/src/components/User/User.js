import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router';
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

import { getUsers } from 'actions';

import styles from 'styles/app.module.less';

class User extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);

    this.setUsernameRef = this.setUsernameRef.bind(this);
    this.setEmailRef = this.setEmailRef.bind(this);
    this.setRolesRef = this.setRolesRef.bind(this);
    this.setTokenRef = this.setTokenRef.bind(this);
  }

  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(getUsers());
  }

  handleSubmit(event) {
    event.preventDefault();

    const user = {
      username: this.usernameRef.value,
      email: this.emailRef.value,
      permissions: this.rolesRef.value,
      refresh_token: this.tokenRef.value,
    };

    this.props.onSubmit(user, () => {
      this.props.router.push('/users');
    });
  }

  setUsernameRef(ref) {
    this.usernameRef = ReactDOM.findDOMNode(ref);
  }

  setEmailRef(ref) {
    this.emailRef = ReactDOM.findDOMNode(ref);
  }

  setRolesRef(ref) {
    this.rolesRef = ReactDOM.findDOMNode(ref);
  }

  setTokenRef(ref) {
    this.tokenRef = ReactDOM.findDOMNode(ref);
  }

  render() {
    const resetUrl = `/users/${this.props.id}/reset/${this.props.token}`;

    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            username
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Username' ref={this.setUsernameRef}
                         defaultValue={this.props.username} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            email
          </Col>

          <Col sm={10}>
            <FormControl type='email' placeholder='email' ref={this.setEmailRef}
                         defaultValue={this.props.email} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            roles
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Roles' ref={this.setRolesRef}
                         defaultValue={this.props.roles} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            token
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Token' ref={this.setTokenRef}
                         defaultValue={this.props.token} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col smOffset={2} sm={2}>
            <LinkContainer to='/users'>
              <Button bsStyle='danger'>
                cancel
              </Button>
            </LinkContainer>
          </Col>

          <Col sm={2} className='pull-right'>
            <Button type='submit' className='pull-right' bsStyle='primary'
                    onClick={this.handleSubmit}>
              submit
            </Button>
          </Col>
        </FormGroup>

        <FormGroup>
          password reset link:
          {' '}
          <a href={resetUrl}>{resetUrl}</a>
        </FormGroup>
      </Form>
    );
  }
}

User.propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  roles: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

export default withRouter(CSSModules(User, styles));
