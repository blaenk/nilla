import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col } from 'react-bootstrap';

import styles from './styles.module.less';

import Download from './Download';
import DownloadContainer from 'containers/Downloads/DownloadContainer';

function DownloadList(props) {
  let downloads = props.downloads.map(download => {
    return (
      <DownloadContainer key={download.infoHash}
                         isHidden={download.isHidden}
                         infoHash={download.infoHash}
                         state={download.state}
                         progress={download.progress}
                         name={download.name}
                         locks={download.locks} />
    );
  });

  return (
    <Row>
      <Col lg={12}>
        <ul styleName='downloads'>
          {downloads}
        </ul>
      </Col>
    </Row>
  );
}

DownloadList.propTypes = {
  downloads: React.PropTypes.arrayOf(React.PropTypes.shape(Download.propTypes)),
};

export default CSSModules(DownloadList, styles);
