import React from 'react';
import { Grid } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import CollapseContainer from 'containers/App/CollapseContainer';
import HeaderContainer from 'containers/App/HeaderContainer';
import UploadContainer from 'containers/App/UploadContainer';
import DropzoneContainer from 'containers/App/DropzoneContainer';

import styles from 'styles/app.module.less';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.setDropzoneRef = this.setDropzoneRef.bind(this);
    this.handleOpenFileDialog = this.handleOpenFileDialog.bind(this);
  }

  setDropzoneRef(ref) {
    this.dropzoneRef = ref;
  }

  handleOpenFileDialog() {
    this.dropzoneRef.getWrappedInstance().open();
  }

  render() {
    return (
      <DropzoneContainer
        style={{}}
        disableClick
        ref={this.setDropzoneRef}
        accept='application/x-bittorrent'>
        <Grid>
          <HeaderContainer />

          <CollapseContainer>
            <div>
              <UploadContainer onClickFiles={this.handleOpenFileDialog} />
            </div>
          </CollapseContainer>

          {this.props.children}
        </Grid>
      </DropzoneContainer>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.node.isRequired,
};

module.exports = CSSModules(App, styles);
