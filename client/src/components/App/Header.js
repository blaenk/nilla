import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import CSSModules from 'react-css-modules';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

import styles from './header.module.less';

function Header(props) {
  const notAdmin = !props.currentUser || !props.currentUser.permissions.includes('admin');

  const usersButton = notAdmin ? null : (
    <LinkContainer to='/users'>
      <NavItem eventKey={4}>Users</NavItem>
    </LinkContainer>
  );

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

          <LinkContainer to='/trackers'>
            <NavItem eventKey={3}>Trackers</NavItem>
          </LinkContainer>

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
