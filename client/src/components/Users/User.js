import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { requestDeleteUser } from 'actions';

class User extends React.PureComponent {
  render() {
    const permissions = this.props.permissions.map(p => {
      return (
        <li key={p}>{p}</li>
      );
    });

    return (
      <tr>
        <td>{this.props.username}</td>
        <td>{this.props.email}</td>
        <td>
          <ul>
            {permissions}
          </ul>
        </td>
        <td style={{ textAlign: 'center' }}>
          <LinkContainer to={`/users/${this.props.id}`}>
            <Button bsStyle='primary' bsSize='xsmall' title='edit'>
              <Glyphicon glyph='edit' />
            </Button>
          </LinkContainer>
        </td>
        <td style={{ textAlign: 'center' }}>
          <Button onClick={this.props.onRemove} bsStyle='danger' bsSize='xsmall' title='delete'>
            <Glyphicon glyph='remove' />
          </Button>
        </td>
      </tr>
    );
  }
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
