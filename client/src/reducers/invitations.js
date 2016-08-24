import {
  REQUEST_INVITATIONS,
  RECEIVE_INVITATIONS,
} from 'actions';

export const DEFAULT_STATE = [];

export default function invitations(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case RECEIVE_INVITATIONS: {
      for (const invitation of action.invitations) {
        invitation.created_at = new Date(invitation.created_at);
      }

      return action.invitations;
    }
    case REQUEST_INVITATIONS:
    default:
      return state;
  }
}
