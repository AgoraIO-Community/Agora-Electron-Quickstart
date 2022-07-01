import AgoraRtcEngine from 'agora-electron-sdk';
import { Button, Card, List, message, Switch } from 'antd';
import React, { Component } from 'react';
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
  iconImageBase64: string;
}

interface State {
  captureInfos: CaptureInfo[];
  isThumbImage: boolean;
}

export default class ScreenShare extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    captureInfos: [],
    isThumbImage: true,
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

  onPressGetScreenCaptureSource = async () => {
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
      readImage(item.iconImage ? item.thumbImage.buffer : new Uint8Array([]))
    );
    const imageList = await Promise.all(imageListPromise);

    const iconImageListPromise = list.map((item) =>
      readImage(item.iconImage ? item.iconImage.buffer : new Uint8Array([]))
    );
    const iconImageList = await Promise.all(iconImageListPromise);
    const captureInfos = list.map((infoObj, index) => ({
      ...infoObj,
      thumbImageBase64: imageList[index],
      iconImageBase64: iconImageList[index],
    }));
    console.log('screenInfoList', captureInfos);
    this.setState({ captureInfos });
  };

  renderRightBar = () => {
    const { isThumbImage } = this.state;
    return (
      <div className={styles.rightBar}>
        <div>
          <div
            style={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            {'Image Mode:   '}
            <Switch
              checkedChildren="Thumb Image"
              unCheckedChildren="Icon Image"
              defaultChecked={isThumbImage}
              onChange={(value) => {
                this.setState({ isThumbImage: value });
              }}
            />
          </div>
          <Button onClick={this.onPressGetScreenCaptureSource}>
            Get Screen Capture Source
          </Button>
        </div>
      </div>
    );
  };

  renderItem = (captureInfo: CaptureInfo, index: number) => {
    const { isThumbImage } = this.state;
    const { sourceTitle, thumbImageBase64, type, sourceName, iconImageBase64 } =
      captureInfo;
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
            src={isThumbImage ? thumbImageBase64 : iconImageBase64}
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
