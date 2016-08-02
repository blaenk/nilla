import { connect } from 'react-redux';
import { setOrder } from 'actions';

import OrderDropDown from 'components/Downloads/OrderDropDown';

function mapStateToProps(state) {
  return {
    order: state.search.order,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onChangeOrder: (order) => {
      dispatch(setOrder(order));
    },
  };
}

const OrderDropDownContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrderDropDown);

export default OrderDropDownContainer;
