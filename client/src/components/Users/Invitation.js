import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Glyphicon } from 'react-bootstrap';

import { requestDeleteInvitation } from 'actions';

class Invitation extends React.PureComponent {
  render() {
    return (
      <tr>
        <td><a href={`/invitations/${this.props.token}`}>{this.props.token}</a></td>
        <td>{this.props.created_at.toISOString()}</td>
        <td style={{ textAlign: 'center' }}>
          <Button onClick={this.props.onRemove} bsStyle='danger' bsSize='xsmall' title='delete'>
            <Glyphicon glyph='remove' />
          </Button>
        </td>
      </tr>
    );
  }
}

Invitation.propTypes = {
  created_at: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
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
