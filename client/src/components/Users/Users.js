import React from 'react';
import { connect } from 'react-redux';
import { Button, Table } from 'react-bootstrap';

import {
  getUsers,
  getInvitations,
  requestCreateInvitation,
} from 'actions';

import Invitation from './Invitation';
import User from './User';

class Users extends React.Component {
  componentWillMount() {
    this.props.dispatch(getUsers());
    this.props.dispatch(getInvitations());
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

    const invitations = this.props.invitations.map(invitation => {
      return (
        <Invitation key={invitation.id}
                    id={invitation.id}
                    token={invitation.token}
                    created_at={invitation.created_at} />
      );
    });

    let invitationsTable;

    if (invitations.length > 0) {
      invitationsTable = (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>token</th>
              <th>created</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {invitations}
          </tbody>
        </Table>
      );
    }

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

        <Button onClick={this.props.handleCreateInvitation}>
          create invitation
        </Button>

        {invitationsTable}
      </div>
    );
  }
}

Users.propTypes = {
  dispatch: React.PropTypes.object.isRequired,
  handleCreateInvitation: React.PropTypes.func.isRequired,
  invitations: React.PropTypes.array.isRequired,
  users: React.PropTypes.array.isRequired,
};

function mapDispatchToUsersProps(dispatch) {
  return {
    handleCreateInvitation() {
      dispatch(requestCreateInvitation());
    },
  };
}

export default connect(null, mapDispatchToUsersProps)(Users);
