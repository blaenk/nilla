import { connect } from 'react-redux';
import { setDownloadsOrder } from 'actions';

import OrderDropDown from 'components/Downloads/OrderDropDown';

function mapStateToProps(state) {
  return {
    order: state.ui.downloads.order,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onChangeOrder: (order) => {
      dispatch(setDownloadsOrder(order));
    },
  };
}

const OrderDropDownContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrderDropDown);

export default OrderDropDownContainer;
