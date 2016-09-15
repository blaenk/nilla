import React from 'react';
import { Grid } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import HeaderContainer from 'containers/App/HeaderContainer';
import RtorrentUnavailableErrorContainer from 'containers/App/RtorrentUnavailableErrorContainer';
import CollapseContainer from 'containers/Upload/CollapseContainer';
import UploadContainer from 'containers/Upload/UploadContainer';
import DropzoneContainer from 'containers/Upload/DropzoneContainer';

import styles from 'styles/app.module.less';

class App extends React.PureComponent {
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
        ref={this.setDropzoneRef}>
        <Grid>
          <HeaderContainer />

          <RtorrentUnavailableErrorContainer />

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

export default CSSModules(App, styles);
