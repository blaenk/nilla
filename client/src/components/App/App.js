import React from 'react';
import {
  Collapse,
  Grid
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import HeaderContainer from 'containers/App/HeaderContainer';
import UploadContainer from 'containers/App/UploadContainer';
import DropzoneContainer from 'containers/App/DropzoneContainer';

import styles from 'styles/app.module.less';

const App = React.createClass({
  propTypes: {
    children: React.PropTypes.node.isRequired,
    isUploading: React.PropTypes.bool.isRequired
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

          {/* TODO create CollapseContainer */}
          <Collapse in={this.props.isUploading}>
            <div>
              <UploadContainer
                onClickFiles={() => this.refs.dropzone.getWrappedInstance().open()} />
            </div>
          </Collapse>

          {this.props.children}
        </Grid>
      </DropzoneContainer>
    );
  }
});

module.exports = CSSModules(App, styles);
