import { connect } from 'react-redux';
import { setOrder } from 'actions';

import OrderDropDown from 'components/Downloads/OrderDropDown';

const mapStateToProps = (state) => {
  return {
    order: state.search.order
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeOrder: (eventKey, _event) => {
      dispatch(setOrder(eventKey));
    }
  };
};

const SetOrder = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrderDropDown);

export default SetOrder;
