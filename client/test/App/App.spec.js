import React from 'react';
import { shallow } from 'enzyme';

import App from 'containers/App/App.js';
import styles from 'styles/app.module.css';

describe('<App />', function () {
  let wrapper;
  beforeEach(function() {
    wrapper = shallow(<App />);
  });

  it('has a single wrapper element', function() {
    expect(wrapper.find(`.${styles.wrapper}`))
            .to.have.length(1);
  });
});
