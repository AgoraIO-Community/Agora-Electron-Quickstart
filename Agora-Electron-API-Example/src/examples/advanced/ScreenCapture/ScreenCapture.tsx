import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card, Button, message } from 'antd';
import config from '../../config/agora.config';
import styles from '../../config/public.scss';
import { readImage } from '../../util/base64';
import screenStyle from './ScreenCapture.scss';

interface CaptureInfo {
  type: number;
  primaryMonitor: boolean;
  processPath: string;
  sourceName: string;
  sourceTitle: string;
  thumbImageBase64: string;
}

interface State {
  captureInfos: CaptureInfo[];
}

export default class ScreenShare extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    captureInfos: [],
  };

  componentDidMount = async () => {
    this.getRtcEngine();
  };

  componentWillUnmount() {
    this.getRtcEngine().release();
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      window.rtcEngine = this.rtcEngine;
      const res = this.rtcEngine.initialize(config.appID);
      console.log('initialize', res);
      this.rtcEngine.setLogFile(config.nativeSDKLogPath);
    }
    return this.rtcEngine;
  }

  onPressGetScrrenCaptureSource = async () => {
    if (!this.getRtcEngine().getScreenCaptureSources) {
      message.error('API not exit on this sdk version');
      return;
    }
    const list = this.getRtcEngine().getScreenCaptureSources(
      { width: 500, height: 500 },
      { width: 500, height: 500 },
      true
    );
    console.log('getScreenCaptureSources', list);

    const imageListPromise = list.map((item) =>
      readImage(item.thumbImage.buffer)
    );
    const imageList = await Promise.all(imageListPromise);
    const captureInfos = list.map((infoObj, index) => ({
      ...infoObj,
      thumbImageBase64: imageList[index],
    }));
    console.log('screenInfoList', captureInfos);
    this.setState({ captureInfos });
  };

  renderRightBar = () => {
    return (
      <div className={styles.rightBar}>
        <Button onClick={this.onPressGetScrrenCaptureSource}>
          Get Screen Capture Source
        </Button>
      </div>
    );
  };

  renderItem = (captureInfo: CaptureInfo, index: number) => {
    const { sourceTitle, thumbImageBase64, type, sourceName } = captureInfo;
    let title = sourceTitle;
    if (title && title.length > 20) {
      title = title.substring(0, 20) + '...';
    } else if (type == 1) {
      title = sourceName;
    } else {
      title = 'no title';
    }

    return (
      <List.Item>
        <Card title={title}>
          <img
            src={thumbImageBase64}
            alt="img shot"
            className={screenStyle.previewShot}
          />
        </Card>
      </List.Item>
    );
  };

  render() {
    const { captureInfos } = this.state;
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          <List
            style={{ width: '100%' }}
            grid={{ gutter: 16, column: 2 }}
            dataSource={captureInfos}
            renderItem={this.renderItem}
          />
        </div>
        {this.renderRightBar()}
      </div>
    );
  }
}
