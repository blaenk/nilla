import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';

chai.use(chaiEnzyme());

expect = chai.expect;
assert = chai.assert;

import React from 'react';
import { shallow } from 'enzyme';

import App from 'containers/App/AppContainer.js';

describe('<App />', function () {
  it('should pass', function() {
    assert.equal(true, true);
  });

  let wrapper;
  beforeEach(function() {
    wrapper = shallow(<App />);
  });

  it('has a Router component', function() {
    expect(wrapper.find('Router')).to.have.length(1);
  });
});
