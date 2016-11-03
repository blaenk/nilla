import React from 'react';
import { Row, Col, Table } from 'react-bootstrap';
import CSSModules from 'react-css-modules';
import filesize from 'filesize';
import moment from 'moment';
import countdown from 'countdown';

import styles from './download.module.less';

function Statistics(props) {
  let countdownString;

  if (props.download.isComplete) {
    countdownString = 'Done';
  } else if (props.download.state !== 'downloading' || props.download.downloadRate === 0) {
    countdownString = 'Not Downloading';
  } else {
    const remainingBytes = props.download.sizeBytes - props.download.completedBytes;
    const remainingSeconds = Math.trunc(remainingBytes / props.download.downloadRate);
    const etaDate = moment().add(remainingSeconds, 'seconds').toDate();

    countdownString = countdown(etaDate).toString();
  }

  const trackers = props.download.trackers.map(t => {
    return (<li key={t}>{t}</li>);
  });

  return (
    <Row>
      <Col lg={12}>
        <div styleName='download-stats'>
          <Table responsive>
            <tbody>
              <tr>
                <td>Ratio</td>
                <td>{props.download.ratio}</td>
              </tr>

              <tr>
                <td>ETA</td>
                <td>{countdownString}</td>
              </tr>

              <tr>
                <td>Download Rate</td>
                <td>{filesize(props.download.downloadRate)}/s</td>
              </tr>

              <tr>
                <td>Upload Rate</td>
                <td>{filesize(props.download.uploadRate)}/s</td>
              </tr>

              <tr>
                <td>Total Uploaded</td>
                <td>{filesize(props.download.totalUploaded)}</td>
              </tr>

              <tr>
                <td>Seeders</td>
                <td>{props.download.seeders}</td>
              </tr>

              <tr>
                <td>Leechers</td>
                <td>{props.download.leeches}</td>
              </tr>

              <tr>
                <td>Trackers</td>
                <td>
                  <ul>
                    {trackers}
                  </ul>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Col>
    </Row>
  );
}

Statistics.propTypes = {
  download: React.PropTypes.object.isRequired,
};

export default CSSModules(Statistics, styles);
