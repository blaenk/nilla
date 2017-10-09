import React from 'react';
import PropTypes from 'prop-types';
import { LinkContainer } from 'react-router-bootstrap';
import CSSModules from 'react-css-modules';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

import { userCan } from 'common';

import styles from './header.module.less';

class Header extends React.PureComponent {
  render() {
    let uploadButton;

    if (this.props.currentUser && userCan(this.props.currentUser, 'upload')) {
      uploadButton = (
        <NavItem eventKey={2} onClick={this.props.onUpload}>Upload</NavItem>
      );
    }

    let trackersButton;

    if (this.props.currentUser && userCan(this.props.currentUser, 'trackers:read')) {
      trackersButton = (
        <LinkContainer to='/trackers'>
          <NavItem eventKey={3}>Trackers</NavItem>
        </LinkContainer>
      );
    }

    let usersButton;

    if (this.props.currentUser && userCan(this.props.currentUser, 'users:read')) {
      usersButton = (
        <LinkContainer to='/users'>
          <NavItem eventKey={4}>Users</NavItem>
        </LinkContainer>
      );
    }

    return (
      <Navbar styleName={this.props.isDragging ? 'dragging' : 'navbar'}>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='https://github.com/blaenk/nilla'>NILLA</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <LinkContainer to='/downloads'>
              <NavItem eventKey={1}>Download</NavItem>
            </LinkContainer>

            {uploadButton}
            {trackersButton}
            {usersButton}
          </Nav>
          <Nav pullRight>
            <NavItem eventKey={5} onClick={this.props.onLogout}>
              Logout
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

Header.propTypes = {
  currentUser: PropTypes.object,
  isDragging: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default CSSModules(Header, styles);
