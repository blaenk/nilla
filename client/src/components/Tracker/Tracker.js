import React from 'react';
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

import { getTrackers } from 'actions';

import styles from 'styles/app.module.less';

class Tracker extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);

    this.setNameRef = this.setNameRef.bind(this);
    this.setUrlRef = this.setUrlRef.bind(this);
    this.setDescriptionRef = this.setDescriptionRef.bind(this);
    this.setUsernameRef = this.setUsernameRef.bind(this);
    this.setPasswordRef = this.setPasswordRef.bind(this);
  }

  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(getTrackers());
  }

  shouldComponentUpdate() {
    return true;
  }

  handleSubmit(event) {
    event.preventDefault();

    const tracker = {
      id: this.props.tracker.id,
      name: this.nameRef.value,
      url: this.urlRef.value,
      description: this.descriptionRef.value,
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

  setDescriptionRef(ref) {
    this.descriptionRef = ReactDOM.findDOMNode(ref);
  }

  setUsernameRef(ref) {
    this.usernameRef = ReactDOM.findDOMNode(ref);
  }

  setPasswordRef(ref) {
    this.passwordRef = ReactDOM.findDOMNode(ref);
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
            <FormControl type='text' placeholder='Name' ref={this.setNameRef}
                         defaultValue={this.props.tracker.name} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            URL
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='URL' ref={this.setUrlRef}
                         defaultValue={this.props.tracker.url} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Description
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Description' ref={this.setDescriptionRef}
                         defaultValue={this.props.tracker.category} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Username
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Username' ref={this.setUsernameRef}
                         defaultValue={this.props.tracker.username} />
          </Col>
        </FormGroup>

        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>
            Password
          </Col>

          <Col sm={10}>
            <FormControl type='text' placeholder='Password' ref={this.setPasswordRef}
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
  dispatch: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  router: React.PropTypes.object.isRequired,
  tracker: React.PropTypes.object.isRequired,
};

export default withRouter(CSSModules(Tracker, styles));
