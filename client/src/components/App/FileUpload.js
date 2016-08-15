import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Checkbox,
  Glyphicon,
  Label,
  ProgressBar,
} from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';

import styles from './upload.module.less';

import { setFileStart } from 'actions';

const StartCheckbox = connect(
  null,
  (dispatch, ownProps) => {
    return {
      onChange(event) {
        dispatch(setFileStart(ownProps.file, event.target.checked));
      },
    };
  }
)(Checkbox);

class FileUpload extends React.Component {
  componentWillMount() {
    this.props.parseFile();
  }

  render() {
    let torrentInfo;

    if (this.props.file.parsed) {
      const trackers = this.props.file.parsed.announce.map((url, index) => {
        return (
          <li key={index}>
            {url}
          </li>
        );
      });

      const files = this.props.file.parsed.files.map((f, index) => {
        f.path = f.path.replace(new RegExp(`^${this.props.file.parsed.name}/`), '');
        f.pathComponents = f.path.split('/');
        f.index = index;

        return f;
      }).sort((a, b) => {
        return a.path.toLocaleLowerCase().localeCompare(b.path.toLocaleLowerCase());
      }).map(f => {
        return (
          <li key={f.path}>
            {f.path} - {filesize(f.length)}
          </li>
        );
      });

      const wrappedName = this.props.file.parsed.name.replace(/\./g, '\u200b.');

      torrentInfo = (
        <div styleName='parsed-section'>
          <div>
            <h3 styleName='torrent-name'>
              {wrappedName}
            </h3>

            <div styleName='torrent-meta'>
              <span styleName='infoHash'>
                {this.props.file.parsed.infoHash}
              </span>

              <span styleName='torrent-separator'>—</span>

              <span styleName='torrent-size'>
                {filesize(this.props.file.parsed.length)}
              </span>
            </div>
          </div>

          <div className='torrent-info'>
            <div styleName='torrent-trackers'>
              <strong>Trackers</strong>

              <ol>
                {trackers}
              </ol>
            </div>

            <div styleName='torrent-files'>
              <strong>Files</strong>

              <ul>
                {files}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    let fileControls;

    if (this.props.file.progress > 0) {
      fileControls = (
        <div className='upload-progress'>
          <ProgressBar styleName='upload-progress'
                       now={this.props.file.progress}
                       label={`${this.props.file.progress}%`} />
        </div>
      );
    } else {
      fileControls = (
        <div>
          <StartCheckbox inline file={this.props.file} defaultChecked={this.props.file.start}>
            start
          </StartCheckbox>

          <Button bsStyle='danger' bsSize='xsmall' styleName='file-button' title='remove'
                  onClick={this.props.onRemove}>
            <Glyphicon glyph='remove' />
          </Button>

          <Button bsStyle='success' bsSize='xsmall' styleName='file-button' title='upload'
                  onClick={this.props.onSubmit}>
            <Glyphicon glyph='arrow-up' />
          </Button>
        </div>
      );
    }

    let fileInfo = (
      <div styleName='file-section'>
        <div styleName='file-info'>
          <span styleName='name'>
            {this.props.file.backingFile.name}
          </span>

          <Label styleName='size'>
            {filesize(this.props.file.backingFile.size)}
          </Label>
        </div>

        <div>
          {fileControls}
        </div>
      </div>
    );

    return (
      <li styleName='file'>
        {fileInfo}

        {torrentInfo}
      </li>
    );
  }
}

FileUpload.propTypes = {
  file: React.PropTypes.object.isRequired,
  onRemove: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  parseFile: React.PropTypes.func.isRequired,
};

export default CSSModules(FileUpload, styles);
