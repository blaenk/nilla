import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap';

import _ from 'lodash';

import styles from './download.module.less';

class EditFiles extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleEnableAll = this.handleEnableAll.bind(this);
    this.handleDisableAll = this.handleDisableAll.bind(this);
    this.handleInvertAll = this.handleInvertAll.bind(this);
    this.handleApply = this.handleApply.bind(this);
  }

  handleApply() {
    const filePriorities = _.pickBy(this.props.ui.filePriorities, (value, key) => {
      return value !== this.props.files[key].isEnabled;
    });

    this.props.apply(filePriorities);
  }

  handleEnableAll() {
    for (const file of this.props.filteredFiles) {
      this.props.enable(file.id);
    }
  }

  handleDisableAll() {
    for (const file of this.props.filteredFiles) {
      this.props.disable(file.id);
    }
  }

  handleInvertAll() {
    for (const file of this.props.filteredFiles) {
      this.props.invert(file.id);
    }
  }

  render() {
    return (
      <Row>
        <Col lg={12}>
          <div styleName='edit-files'>
            <ButtonGroup justified>
              <ButtonGroup>
                <Button bsStyle='danger' onClick={this.props.handleCancel}>
                  Cancel
                </Button>
              </ButtonGroup>

              <ButtonGroup>
                <Button onClick={this.handleEnableAll}>
                  Enable all
                </Button>
              </ButtonGroup>

              <ButtonGroup>
                <Button onClick={this.handleInvertAll}>
                  Invert all
                </Button>
              </ButtonGroup>

              <ButtonGroup>
                <Button onClick={this.handleDisableAll}>
                  Disable all
                </Button>
              </ButtonGroup>

              <ButtonGroup>
                <Button bsStyle='success' onClick={this.handleApply}>
                  Apply
                </Button>
              </ButtonGroup>
            </ButtonGroup>

            <div styleName='edit-help'>
              <ul>
                <li>{"Click on files to toggle whether they're enabled or not."}</li>
                <li>{"Click on folder checkboxes to toggle all contained files."}</li>
                <li>
                  <strong>{"Enable all"}</strong>
                  {" "}
                  {"enables all files that aren't filtered out by a search filter. "}
                  This means you can filter the files and then use this button to only enable those.
                  {" "}
                  The same goes for
                  {" "}
                  <strong>Disable all</strong>
                  {" and "}
                  <strong>Invert all</strong>
                  {"."}
                </li>
                <li>Click <strong>apply</strong> when done.</li>
              </ul>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

EditFiles.propTypes = {
  apply: React.PropTypes.func.isRequired,
  disable: React.PropTypes.func.isRequired,
  enable: React.PropTypes.func.isRequired,
  files: React.PropTypes.array.isRequired,
  filteredFiles: React.PropTypes.array.isRequired,
  handleCancel: React.PropTypes.func.isRequired,
  invert: React.PropTypes.func.isRequired,
  ui: React.PropTypes.object.isRequired,
};

export default CSSModules(EditFiles, styles);
