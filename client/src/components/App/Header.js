import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import CSSModules from 'react-css-modules';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

import styles from './header.module.less';

const Header = function(props) {
  return (
    <Navbar styleName={props.isDragging ? 'dragging' : 'navbar'}>
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

          <NavItem eventKey={2} onClick={props.onUpload}>Upload</NavItem>

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

Header.propTypes = {
  isDragging: React.PropTypes.bool.isRequired,
  onUpload: React.PropTypes.func.isRequired
};

export default CSSModules(Header, styles);
