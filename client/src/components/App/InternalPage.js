import React from 'react';
import { Grid } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import CollapseContainer from 'containers/App/CollapseContainer';
import HeaderContainer from 'containers/App/HeaderContainer';
import UploadContainer from 'containers/App/UploadContainer';
import DropzoneContainer from 'containers/App/DropzoneContainer';

import styles from 'styles/app.module.less';

const App = React.createClass({
  propTypes: {
    children: React.PropTypes.node.isRequired,
  },

  render: function() {
    return (
      <DropzoneContainer
        style={{}}
        disableClick={true}
        ref='dropzone'
        accept='application/x-bittorrent'>
        <Grid>
          <HeaderContainer />

          <CollapseContainer>
            <div>
              <UploadContainer
                onClickFiles={() => this.refs.dropzone.getWrappedInstance().open()} />
            </div>
          </CollapseContainer>

          {this.props.children}
        </Grid>
      </DropzoneContainer>
    );
  },
});

module.exports = CSSModules(App, styles);
