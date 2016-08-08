import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap';

import { getDownload, getUser } from 'actions';

import Header from './Header';
import File from './File';
import FilesSection from './FilesSection';

import SearchContainer from 'containers/Download/SearchContainer';
import CommandBarContainer from 'containers/Download/CommandBarContainer';

import styles from './download.module.less';

class Download extends React.Component {
  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(getDownload(this.props.infoHash));
  }

  componentWillReceiveProps(nextProps) {
    for (const userID of nextProps.download.locks) {
      if (!(userID in nextProps.users)) {
        this.props.dispatch(getUser(userID));
      }
    }
  }

  render() {
    const { download, ui, files, users } = this.props;

    if (!download || !ui.isAugmented) {
      return null;
    }

    // TODO
    // use a spinner via ui.isFetching

    const fileCount = files.downloaded.length + files.extracted.length;

    let editHelp;

    if (ui.isEditing) {
      editHelp = (
        <Row>
          <Col lg={12}>
            <div styleName='edit-files'>
              <ButtonGroup justified>
                <ButtonGroup>
                  <Button bsStyle='danger'>Cancel</Button>
                </ButtonGroup>

                <ButtonGroup>
                  <Button>Enable all</Button>
                </ButtonGroup>

                <ButtonGroup>
                  <Button>Disable all</Button>
                </ButtonGroup>

                <ButtonGroup>
                  <Button bsStyle='success'>Apply</Button>
                </ButtonGroup>
              </ButtonGroup>

              <div styleName='edit-help'>
                <ul>
                  <li>Click on files to toggle whether they're enabled or not.</li>
                  <li>Click on folder checkboxes to toggle all contained files.</li>
                  <li>
                    <strong>Enable all</strong> enables all <em>visible</em> files.
                    This means you can filter the files and then use this button
                    to enable everything that is visible given the filter.
                    Same goes for <strong>Disable all</strong>.
                  </li>
                  <li>Click <strong>apply</strong> when done.</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>
      );
    }

    return (
      <div>
        <Row>
          <Col lg={12}>
            <Header infoHash={download.infoHash}
                    dateAdded={download.dateAdded}
                    name={download.name}
                    state={download.state}
                    progress={download.progress}
                    uploader={download.uploader}
                    locks={download.locks}
                    users={users} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <CommandBarContainer infoHash={this.props.infoHash} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <SearchContainer count={fileCount} infoHash={this.props.infoHash} />
          </Col>
        </Row>

        {editHelp}

        <Row>
          <Col lg={12}>
            <FilesSection label='EXTRACTED'
                          depth={1}
                          files={files.extracted}
                          isMultiFile={download.isMultiFile}
                          initialCollapse={ui.isCollapsed}
                          downloadName={download.name} />

            <FilesSection label='DOWNLOADED'
                          showLabelIf={download.files.extracted.length > 0}
                          files={files.downloaded}
                          isMultiFile={download.isMultiFile}
                          initialCollapse={ui.isCollapsed}
                          isEditing={ui.isEditing}
                          downloadName={download.name} />
          </Col>
        </Row>
      </div>
    );
  }
}

const filesProps = File.propTypes;

Download.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  download: React.PropTypes.shape({
    dateAdded: React.PropTypes.string.isRequired,
    files: React.PropTypes.shape({
      downloaded: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
      extracted: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
    }),
    infoHash: React.PropTypes.string.isRequired,
    isMultiFile: React.PropTypes.bool.isRequired,
    locks: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
    params: React.PropTypes.object.isRequired,
    progress: React.PropTypes.number.isRequired,
    state: React.PropTypes.string.isRequired,
    uploader: React.PropTypes.string.isRequired,
  }),
  files: React.PropTypes.shape({
    downloaded: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
    extracted: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
  }),
  infoHash: React.PropTypes.string.isRequired,
  params: React.PropTypes.object.isRequired,
  ui: React.PropTypes.shape({
    isFetching: React.PropTypes.bool.isRequired,
  }),
};

export default CSSModules(Download, styles);
