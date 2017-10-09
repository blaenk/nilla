import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
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

import { getTrackers } from 'actions';

import styles from 'styles/app.module.less';

class Tracker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);

    this.setNameRef = this.setNameRef.bind(this);
    this.setUrlRef = this.setUrlRef.bind(this);
    this.setCategoryRef = this.setCategoryRef.bind(this);
    this.setUsernameRef = this.setUsernameRef.bind(this);
    this.setPasswordRef = this.setPasswordRef.bind(this);
  }

  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(getTrackers());
  }

  handleSubmit(event) {
    event.preventDefault();

    const tracker = {
      name: this.nameRef.value,
      url: this.urlRef.value,
      category: this.categoryRef.value,
      username: this.usernameRef.value,
      password: this.passwordRef.value,
    };

    this.props.onSubmit(tracker, () => {
      this.props.router.push('/trackers');
    });
  }

  setNameRef(ref) {
    this.nameRef = ReactDOM.findDOMNode(ref);
  }

  setUrlRef(ref) {
    this.urlRef = ReactDOM.findDOMNode(ref);
  }

  setCategoryRef(ref) {
    this.categoryRef = ReactDOM.findDOMNode(ref);
  }

  setUsernameRef(ref) {
    this.usernameRef = ReactDOM.findDOMNode(ref);
  }

  setPasswordRef(ref) {
    this.passwordRef = ReactDOM.findDOMNode(ref);
  }

  render() {
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Name
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Name' ref={this.setNameRef}
                         defaultValue={this.props.name} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            URL
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='URL' ref={this.setUrlRef}
                         defaultValue={this.props.url} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Category
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Category' ref={this.setCategoryRef}
                         defaultValue={this.props.category} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Username
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Username' ref={this.setUsernameRef}
                         defaultValue={this.props.username} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Password
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Password' ref={this.setPasswordRef}
                         defaultValue={this.props.password} />
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
            <Button type='submit' className='pull-right' bsStyle='primary'
                    onClick={this.handleSubmit}>
              submit
            </Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}

Tracker.propTypes = {
  category: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

export default withRouter(CSSModules(Tracker, styles));
