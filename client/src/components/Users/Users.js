import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Glyphicon,
  Table,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { getUsers, requestDeleteUser } from 'actions';

function User(props) {
  return (
    <tr>
      <td>{props.username}</td>
      <td>{props.email}</td>
      <td>{props.permissions.join(', ')}</td>
      <td style={{ textAlign: 'center' }}>
        <LinkContainer to={`/users/${props.id}`}>
          <Button bsStyle='primary' bsSize='xsmall' title='edit'>
            <Glyphicon glyph='edit' />
          </Button>
        </LinkContainer>
      </td>
      <td style={{ textAlign: 'center' }}>
        <Button onClick={props.onRemove} bsStyle='danger' bsSize='xsmall' title='delete'>
          <Glyphicon glyph='remove' />
        </Button>
      </td>
    </tr>
  );
}

User.propTypes = {
  email: React.PropTypes.string.isRequired,
  id: React.PropTypes.number.isRequired,
  permissions: React.PropTypes.array.isRequired,
  username: React.PropTypes.string.isRequired,
};

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onRemove() {
      dispatch(requestDeleteUser(ownProps.id));
    },
  };
}

User = connect(null, mapDispatchToProps)(User);

class Users extends React.Component {
  componentDidMount() {
    this.props.dispatch(getUsers());
  }

  render() {
    const users = this.props.users.map(user => {
      return (
        <User key={user.id}
              id={user.id}
              username={user.username}
              email={user.email}
              permissions={user.permissions} />
      );
    });

    return (
      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>name</th>
              <th>email</th>
              <th>permissions</th>
              <th />
              <th />
            </tr>
          </thead>

          <tbody>
            {users}
          </tbody>
        </Table>

        <Button>
          create invitation
        </Button>
      </div>
    );
  }
}

Users.propTypes = {
  dispatch: React.PropTypes.object.isRequired,
  users: React.PropTypes.array.isRequired,
};

export default Users;
