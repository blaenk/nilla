import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Table } from 'react-bootstrap';

import { getTrackers } from 'actions';
import { userCan } from 'common';

import Tracker from './Tracker';

class Trackers extends React.Component {
  componentWillMount() {
    this.props.dispatch(getTrackers());
  }

  render() {
    if (!this.props.currentUser) {
      return null;
    }

    const trackers = this.props.trackers.map(tracker => {
      return (
        <Tracker key={tracker.id}
                 id={tracker.id}
                 name={tracker.name}
                 url={tracker.url}
                 category={tracker.category}
                 username={tracker.username}
                 password={tracker.password}
                 currentUser={this.props.currentUser} />
      );
    });

    const canEdit = userCan(this.props.currentUser, 'trackers:write');

    const newTrackerButton = canEdit ? (
      <LinkContainer to='/trackers/new'>
        <Button>
          new tracker
        </Button>
      </LinkContainer>
    ) : null;

    return (
      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>name</th>
              <th>category</th>
              <th>user</th>
              <th>pass</th>

              {canEdit && (<th />)}
              {canEdit && (<th />)}
            </tr>
          </thead>

          <tbody>
            {trackers}
          </tbody>
        </Table>

        {newTrackerButton}
      </div>
    );
  }
}

Trackers.propTypes = {
  currentUser: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.object.isRequired,
  handleCreateTracker: React.PropTypes.func.isRequired,
  trackers: React.PropTypes.array.isRequired,
};

export default Trackers;
