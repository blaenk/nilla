import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon } from 'react-bootstrap';

import { requestDeleteInvitation } from 'actions';

function Invitation(props) {
  return (
    <tr>
      <td><a href={`/invitations/${props.token}`}>{props.token}</a></td>
      <td>{props.created_at.toISOString()}</td>
      <td style={{ textAlign: 'center' }}>
        <Button onClick={props.onRemove} bsStyle='danger' bsSize='xsmall' title='delete'>
          <Glyphicon glyph='remove' />
        </Button>
      </td>
    </tr>
  );
}

Invitation.propTypes = {
  created_at: React.PropTypes.object.isRequired,
  id: React.PropTypes.number.isRequired,
  onRemove: React.PropTypes.func.isRequired,
  token: React.PropTypes.string.isRequired,
};

function mapDispatchToInvitationProps(dispatch, ownProps) {
  return {
    onRemove() {
      if (confirm('are you sure you want to delete this invitation?')) {
        dispatch(requestDeleteInvitation(ownProps.token));
      }
    },
  };
}

export default connect(null, mapDispatchToInvitationProps)(Invitation);
