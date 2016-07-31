import React from 'react';
import { Table } from 'react-bootstrap';
import filesize from 'filesize';

import ErrorAlert from './ErrorAlert';

const RejectedFilesErrorAlert = (props) => {
  if (props.rejectedFiles.length > 0) {
    let files = props.rejectedFiles.map(file => {
      return (
        <tr key={file.name}>
          <td>{file.name}</td>
          <td>{filesize(file.size)}</td>
          <td>{file.type || 'unknown'}</td>
        </tr>
      );
    });

    return (
      <ErrorAlert title='Unrecognized File!'
                  onDismiss={props.onDismiss}>
        <p>
          One or more of the files you chose is not a torrent! Please try
          again without those files.
        </p>

        <p>Here are the files you attempted to upload:</p>

        <Table striped responsive>
          <thead>
            <tr>
              <th>name</th>
              <th>size</th>
              <th>type</th>
            </tr>
          </thead>
          <tbody>
            {files}
          </tbody>
        </Table>
      </ErrorAlert>
    );
  }

  return null;
};

RejectedFilesErrorAlert.propTypes = {
  rejectedFiles: React.PropTypes.array,
  onDismiss: React.PropTypes.func.isRequired,
};

export default RejectedFilesErrorAlert;
