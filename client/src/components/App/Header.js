import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import CSSModules from 'react-css-modules';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

import { userCan } from 'common';

import styles from './header.module.less';

function Header(props) {
  let trackersButton;

  if (props.currentUser && userCan(props.currentUser, 'trackers:read')) {
    trackersButton = (
      <LinkContainer to='/trackers'>
        <NavItem eventKey={3}>Trackers</NavItem>
      </LinkContainer>
    );
  }

  let usersButton;

  if (props.currentUser && userCan(props.currentUser, 'users:read')) {
    usersButton = (
      <LinkContainer to='/users'>
        <NavItem eventKey={4}>Users</NavItem>
      </LinkContainer>
    );
  }

  return (
    <Navbar styleName={props.isDragging ? 'dragging' : 'navbar'}>
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

          <NavItem eventKey={2} onClick={props.onUpload}>Upload</NavItem>

          {trackersButton}
          {usersButton}
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={5} onClick={props.onLogout}>
            Logout
          </NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

Header.propTypes = {
  currentUser: React.PropTypes.object.isRequired,
  isDragging: React.PropTypes.bool.isRequired,
  onLogout: React.PropTypes.func.isRequired,
  onUpload: React.PropTypes.func.isRequired,
};

export default CSSModules(Header, styles);
