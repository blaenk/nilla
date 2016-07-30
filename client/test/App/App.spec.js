import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';

chai.use(chaiEnzyme());

expect = chai.expect;
assert = chai.assert;

import React from 'react';
import { shallow } from 'enzyme';

import AppContainer from 'containers/App/AppContainer';

describe('<AppContainer />', function () {
  it('should pass', function() {
    assert.equal(true, true);
  });

  let wrapper;

  beforeEach(function() {
    wrapper = shallow(<AppContainer />);
  });

  it('has a Router component', function() {
    expect(wrapper.find('Router')).to.have.length(1);
  });
});
