import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';

chai.use(chaiEnzyme());

expect = chai.expect;
assert = chai.assert;

import React from 'react';
import { shallow } from 'enzyme';

import App from 'containers/App/App.js';
import styles from 'styles/app.module.css';

describe('<App />', function () {
  it('should pass', function() {
    assert.equal(true, true);
  });

  let wrapper;
  beforeEach(function() {
    wrapper = shallow(<App />);
  });

  it('has a single wrapper element', function() {
    expect(wrapper.find(`.${styles.wrapper}`))
            .to.have.length(1);
  });
});
