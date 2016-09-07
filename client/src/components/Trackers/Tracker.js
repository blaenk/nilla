import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard';

import { requestDeleteTracker } from 'actions';
import { userCan } from 'common';

class Tracker extends React.PureComponent {
  render() {
    const canEdit = userCan(this.props.currentUser, 'trackers:write');

    const editColumn = canEdit ? (
      <td style={{ textAlign: 'center' }}>
        <LinkContainer to={`/trackers/${this.props.id}`}>
          <Button bsStyle='primary' bsSize='xsmall' title='edit'>
            <Glyphicon glyph='edit' />
          </Button>
        </LinkContainer>
      </td>
    ) : null;

    const removeColumn = canEdit ? (
      <td style={{ textAlign: 'center' }}>
        <Button onClick={this.props.onRemove} bsStyle='danger' bsSize='xsmall' title='delete'>
          <Glyphicon glyph='remove' />
        </Button>
      </td>
    ) : null;

    return (
      <tr>
        <td><a href={`http://anonym.to/?${this.props.url}`}>{this.props.name}</a></td>
        <td>{this.props.category}</td>

        <td style={{ textAlign: 'center' }}>
          <CopyToClipboard text={this.props.username}>
            <Button bsStyle='info' bsSize='xsmall' title='copy username'>
              <Glyphicon glyph='user' />
            </Button>
          </CopyToClipboard>
        </td>

        <td style={{ textAlign: 'center' }}>
          <CopyToClipboard text={this.props.password}>
            <Button bsStyle='warning' bsSize='xsmall' title='copy password'>
              <Glyphicon glyph='asterisk' />
            </Button>
          </CopyToClipboard>
        </td>

        {editColumn}
        {removeColumn}
      </tr>
    );
  }
}

Tracker.propTypes = {
  category: React.PropTypes.string.isRequired,
  currentUser: React.PropTypes.object.isRequired,
  id: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
  onRemove: React.PropTypes.func.isRequired,
  password: React.PropTypes.string.isRequired,
  url: React.PropTypes.string.isRequired,
  username: React.PropTypes.string.isRequired,
};

function mapDispatchToTrackerProps(dispatch, ownProps) {
  return {
    onRemove() {
      if (confirm(`are you sure you want to delete tracker '${ownProps.name}'?`)) {
        dispatch(requestDeleteTracker(ownProps.id));
      }
    },
  };
}

export default connect(null, mapDispatchToTrackerProps)(Tracker);
