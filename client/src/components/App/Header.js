import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import CSSModules from 'react-css-modules';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

import styles from './header.module.less';

const Header = function() {
  return (
    <Navbar styleName='navbar'>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="https://github.com/blaenk/nilla">NILLA</a>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav>
          <LinkContainer to={{pathname: '/downloads'}}>
            <NavItem eventKey={1}>Download</NavItem>
          </LinkContainer>

          <LinkContainer to={{pathname: '/upload'}} active={false}>
            <NavItem eventKey={2}>Upload</NavItem>
          </LinkContainer>

          <LinkContainer to={{pathname: '/trackers'}}>
            <NavItem eventKey={3}>Trackers</NavItem>
          </LinkContainer>

          <LinkContainer to={{pathname: '/users'}}>
            <NavItem eventKey={4}>Users</NavItem>
          </LinkContainer>
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={1} href="/logout">Logout</NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CSSModules(Header, styles);
