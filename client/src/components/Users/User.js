import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { requestDeleteUser } from 'actions';

function User(props) {
  const permissions = props.permissions.map(p => {
    return (
      <li key={p}>{p}</li>
    );
  });

  return (
    <tr>
      <td>{props.username}</td>
      <td>{props.email}</td>
      <td>
        <ul>
          {permissions}
        </ul>
      </td>
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
  onRemove: React.PropTypes.func.isRequired,
  permissions: React.PropTypes.array.isRequired,
  username: React.PropTypes.string.isRequired,
};

function mapDispatchToUserProps(dispatch, ownProps) {
  return {
    onRemove() {
      if (confirm('are you sure you want to delete this user?')) {
        dispatch(requestDeleteUser(ownProps.id));
      }
    },
  };
}

export default connect(null, mapDispatchToUserProps)(User);