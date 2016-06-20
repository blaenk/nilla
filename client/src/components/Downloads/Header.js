import React from 'react';
import CSSModules from 'react-css-modules';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

import styles from './header.module.less';

const Header = function() {
  return (
    <Navbar styleName='navbar'>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="">NILLA</a>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav>
          <NavItem eventKey={1} href="/downloads">Download</NavItem>
          <NavItem eventKey={2} href="/upload">Upload</NavItem>
          <NavItem eventKey={3} href="/trackers">Trackers</NavItem>
          <NavItem eventKey={4} href="/users">Users</NavItem>
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={1} href="/logout">Logout</NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CSSModules(Header, styles);
