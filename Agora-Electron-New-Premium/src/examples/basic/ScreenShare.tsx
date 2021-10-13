import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { Card, message } from 'antd';
import config from '../../agora.config';
import DropDownButton from '../component/DropDownButton';
import styles from './index.scss';
import screenStyle from './ScreenShare.scss';
import JoinChannelBar from '../component/JoinChannelBar';
import Window from '../component/Window';
import { readImage } from '../util/base64';

interface State {
  currentFps?: number;
  currentResolution?: { width: number; height: number };
  screenInfoList: any[];
  windowInfoList: any[];
  localVideoSourceUid?: number;
  selectedShareInfo?: { type: 'screen' | 'window'; info: any };
}

const SCREEN_SHARE_ID = 99;

export default class ScreenShare extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    screenInfoList: [],
    windowInfoList: [],
  };

  componentDidMount = async () => {
    this.getRtcEngine().enableVideo();

    await this.getWindowInfoList();
    await this.getScreenInfoList();
  };

  componentWillUnmount() {
    this.onPressStopSharing();
    this.getRtcEngine().release();
  }

  getScreenInfoList = async () => {
    const list = this.getRtcEngine().getScreenDisplaysInfo();
    const imageListPromise = list.map((item) => readImage(item.image));
    const imageList = await Promise.all(imageListPromise);
    const screenInfoList = list.map(({ displayId }, index) => ({
      name: `Display ${index + 1}`,
      image: imageList[index],
      displayId,
    }));

    this.setState({ screenInfoList });
  };

  getWindowInfoList = async () => {
    const list = this.getRtcEngine().getScreenWindowsInfo();

    const imageListPromise = list.map((item) => readImage(item.image));
    const imageList = await Promise.all(imageListPromise);

    const windowInfoList = list.map(({ ownerName, name, windowId }, index) => ({
      ownerName,
      image: imageList[index],
      windowId,
      name:
        name.length < 20
          ? name === ''
            ? 'no name'
            : name
          : name.replace(/\s+/g, '').substr(0, 20) + '...',
    }));
    this.setState({ windowInfoList });
  };

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine();
      this.subscribeEvents(this.rtcEngine);
      const res = this.rtcEngine.initialize(config.appID);
      console.log('initialize', res);
      this.rtcEngine.setLogFile(config.nativeSDKLogPath);
      this.rtcEngine.setAddonLogFile(config.addonLogPath);
    }
    return this.rtcEngine;
  }

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on('joinedChannel', (channel, uid, elapsed) => {
      console.log(
        `onJoinChannel channel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          rtcEngine.getVersion()
        )})`
      );
    });
    rtcEngine.on('userJoined', (uid, elapsed) => {
      if (uid === SCREEN_SHARE_ID) {
        console.log(`screen share join ---- ${SCREEN_SHARE_ID}`);
        return;
      }
      console.log(`userJoined ---- ${uid}`);
    });
    rtcEngine.on('userOffline', (uid, reason) => {});

    rtcEngine.on('error', (err) => {
      console.error(err);
    });
    rtcEngine.on('firstLocalVideoFrame', (width, height, elapsed) => {
      console.log(`firstLocalVideoFrame width: ${width}, ${height}`);
    });
    rtcEngine.on('videoSourceApiCallExecuted', (api, err) =>
      console.log(`videoSourceApiCallExecuted ${api} ${err}`)
    );
  };

  initializeVideoSource = () => {
    const rtcEngine = this.getRtcEngine();
    console.log('config.appID', config.appID);

    rtcEngine.videoSourceInitialize(config.appID);
    rtcEngine.videoSourceSetLogFile(config.nativeSDKLogPath);
    rtcEngine.videoSourceSetAddonLogFile(config.videoSourceAddonLogPath);
    rtcEngine.videoSourceEnableAudio();
  };

  startScreenOrWindowCapture = (type: string, screenSymbol: any) => {
    const rtcEngine = this.getRtcEngine();
    // rtcEngine.startScreenCapture2(windowId, captureFreq, rect, bitrate);
    // there's a known limitation that, videosourcesetvideoprofile has to be called at least once
    // note although it's called, it's not taking any effect, to control the screenshare dimension, use captureParam instead
    console.log(`start sharing display ${JSON.stringify(screenSymbol)}`);
    rtcEngine.videoSourceSetVideoProfile(43, false);
    console.log('startScreenOrWindowCapture');
    console.log('type', type);
    console.log('screenSymbol', screenSymbol);

    const excludeList = new Array<number>();
    if (type === 'screen') {
      rtcEngine.videoSourceStartScreenCaptureByScreen(
        screenSymbol,
        { x: 0, y: 0, width: 0, height: 0 },
        {
          width: 0,
          height: 0,
          bitrate: 500,
          frameRate: 5,
          captureMouseCursor: true,
          windowFocus: false,
          excludeWindowList: excludeList,
          excludeWindowCount: excludeList.length,
        }
      );
      rtcEngine.startScreenCapturePreview();
    } else {
      // window

      const pix = window.devicePixelRatio;
      const value = 100;
      const resultValue = pix * value;
      rtcEngine.videoSourceStartScreenCaptureByWindow(
        screenSymbol,
        {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
        {
          width: 0,
          height: 0,
          bitrate: 500,
          frameRate: 15,
          captureMouseCursor: true,
          windowFocus: false,
          excludeWindowList: excludeList,
          excludeWindowCount: excludeList.length,
        }
      );
      rtcEngine.startScreenCapturePreview();
    }
  };

  videoSourceJoinChannel = async (
    channelId: string,
    info = '',
    timeout = 5000
  ): Promise<number> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Join Channel Timeout'));
      }, timeout);
      const rtcEngine = this.getRtcEngine();

      rtcEngine.once('videosourcejoinedsuccess', (uid) => {
        clearTimeout(timer);
        console.log(`videoSourceJoinChannelSuccess`);
        resolve(uid);
      });
      rtcEngine.once('videoSourceLeaveChannel', () => {
        console.log(`videoSourceLeaveChannel`);
      });
      try {
        rtcEngine.videoSourceJoin(
          config.token,
          channelId,
          info,
          SCREEN_SHARE_ID
        );
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });

  onPressStartShare = async (channelId: string) => {
    const { selectedShareInfo } = this.state;

    if (!selectedShareInfo) {
      message.error('Must select a window/screen to share');
      return true;
    }

    const {
      info: { displayId, windowId },
      type,
    } = selectedShareInfo;

    this.initializeVideoSource();

    try {
      const localVideoSourceUid = await this.videoSourceJoinChannel(channelId);

      this.setState({
        localVideoSourceUid,
      });
      await this.startScreenOrWindowCapture(type, displayId || windowId);
    } catch (error) {
      message.error('Screen Share Fail');
    }
  };

  onPressStopSharing = () => {
    const rtcEngine = this.getRtcEngine();

    rtcEngine.stopScreenCapture2();
    rtcEngine.videoSourceLeave();
    rtcEngine.videoSourceRelease();

    this.setState({ localVideoSourceUid: undefined });
  };

  renderPopup = (item: { image: string }) => {
    return (
      <div>
        <img src={item.image} alt="preview img" />
      </div>
    );
  };

  renderRightBar = () => {
    const { windowInfoList, screenInfoList, selectedShareInfo } = this.state;
    const {
      type,
      info: { image, name },
    } = selectedShareInfo || {
      type: undefined,
      info: { image: undefined, name: undefined },
    };

    return (
      <div className={styles.rightBar}>
        <div>
          <div>Please Select a window/scrren to share</div>
          <DropDownButton
            title="Screen Share"
            options={screenInfoList.map((obj) => ({
              dropId: obj,
              dropText: obj.name,
            }))}
            PopContent={this.renderPopup}
            PopContentTitle="Preview"
            onPress={(res) => {
              this.setState({
                selectedShareInfo: { type: 'screen', info: res.dropId },
              });
            }}
          />
          <DropDownButton
            title="Windows Share"
            options={windowInfoList.map((obj) => ({
              dropId: obj,
              dropText: obj.name,
            }))}
            PopContent={this.renderPopup}
            PopContentTitle="Preview"
            onPress={(res) => {
              this.setState({
                selectedShareInfo: { type: 'window', info: res.dropId },
              });
            }}
          />
          <div className={styles.selectedItem}>
            <span className={styles.require}>* </span>Current Selected
          </div>
          <div>
            <div>Type: {type}</div>
            <div>Name: {name}</div>
            <div>
              {image && (
                <img
                  src={image}
                  alt="img shot"
                  className={screenStyle.previewShot}
                />
              )}
            </div>
          </div>
        </div>
        <JoinChannelBar
          buttonTitle="Start Share"
          buttonTitleDisable="Stop"
          onPressJoin={this.onPressStartShare}
          onPressLeave={this.onPressStopSharing}
        />
      </div>
    );
  };

  render() {
    const { localVideoSourceUid } = this.state;
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {localVideoSourceUid && (
            <Card title="Local Share" className={styles.card}>
              <Window rtcEngine={this.rtcEngine!} role="localVideoSource" />
            </Card>
          )}
        </div>
        {this.renderRightBar()}
      </div>
    );
  }
}
