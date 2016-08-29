import {
  REQUEST_TRACKERS,
  RECEIVE_TRACKERS,
} from 'actions';

export const DEFAULT_STATE = [];

export default function trackers(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case RECEIVE_TRACKERS:
      return action.trackers;
    case REQUEST_TRACKERS:
    default:
      return state;
  }
}
