import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { Card, message } from 'antd';
import config from '../../config/agora.config';
import DropDownButton from '../../component/DropDownButton';
import styles from '../../config/public.scss';
import screenStyle from './ScreenShare.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import Window from '../../component/Window';
import { readImage } from '../../util/base64';
import ChooseFilterWindowModal from '../../component/ChooseFilterWindowModal';
import { configMapToOptions } from '../../util';
import { FpsMap, ResolutionMap } from '../../config';
import SliderBar from '../../component/SliderBar';

interface State {
  currentFps?: number;
  currentResolution?: { width: number; height: number };
  bitrate: number;
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
    currentFps: 5,
    bitrate: 50,
  };

  componentDidMount = async () => {
    await this.getWindowInfoList();
    await this.getScreenInfoList();
  };

  componentWillUnmount() {
    this.onPressStopSharing();
    this.getRtcEngine().release();
  }

  getScreenInfoList = async () => {
    let list = this.getRtcEngine()
      .getScreenCaptureSources(
        { width: 400, height: 400 },
        { width: 400, height: 400 },
        true
      )
      .filter((obj) => obj.type === 1);
    Promise.all(list.map((item) => readImage(item.thumbImage.buffer))).then(
      (imageList) => {
        console.log('imageList\n', imageList);
        let displayList = list.map((item, index) => {
          return {
            ownerName: '',
            name: `Display ${index + 1}`,
            displayId: {
              x: 0,
              y: 0,
              width: 400,
              height: 400,
              id: item.sourceId,
            }, //item.sourceId,
            image: imageList[index],
          };
        });
        this.setState({
          screenInfoList: displayList,
        });
      }
    );
  };

  getWindowInfoList = async () => {
    let myResolve: any;
    const promise = new Promise((resolve, reject) => {
      myResolve = resolve;
    });
    this.getRtcEngine().getScreenWindowsInfo((list) => {
      myResolve(list);
    });
    const list = (await promise) as {
      ownerName: string;
      name: string;
      windowId: number;
      image: Uint8Array;
    }[];
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
    return windowInfoList;
  };

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      window.rtcEngine = this.rtcEngine;
      this.subscribeEvents(this.rtcEngine);
      const res = this.rtcEngine.initialize(config.appID);
      console.log('initialize', res);
      this.rtcEngine.setLogFile(config.nativeSDKLogPath);
      this.rtcEngine.setAddonLogFile(config.addonLogPath);
    }
    return this.rtcEngine;
  }

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on('videoSourceScreenCaptureInfoUpdated', (info) => {
      console.log('videoSourceScreenCaptureInfoUpdated', info);
    });
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
    rtcEngine.videoSourceSetLogFile(config.nativeSDKVideoSourceLogPath);
    rtcEngine.videoSourceSetAddonLogFile(config.videoSourceAddonLogPath);
    rtcEngine.videoSourceEnableAudio();
  };

  startScreenOrWindowCapture = (
    type: string,
    screenSymbol: any,
    excludeList: Array<number> = []
  ) => {
    const {
      currentFps: frameRate,
      currentResolution: { width, height },
      bitrate,
    } = this.state;
    const rtcEngine = this.getRtcEngine();
    // rtcEngine.startScreenCapture2(windowId, captureFreq, rect, bitrate);
    // there's a known limitation that, videosourcesetvideoprofile has to be called at least once
    // note although it's called, it's not taking any effect, to control the screenshare dimension, use captureParam instead
    console.log(`start sharing display ${JSON.stringify(screenSymbol)}`);
    rtcEngine.videoSourceSetVideoProfile(43, false);
    console.log('startScreenOrWindowCapture');
    console.log('type', type);
    console.log('screenSymbol', screenSymbol);

    const captureParam = {
      width,
      height,
      bitrate,
      frameRate: frameRate!,
      captureMouseCursor: true,
      windowFocus: false,
      excludeWindowList: excludeList,
      excludeWindowCount: excludeList.length,
      enableHighLight: true,
      highLightWidth: 2,
      highLightColor: 0xffff0000,
    };
    console.log('CaptureParam', captureParam);
    if (type === 'screen') {
      rtcEngine.videoSourceStartScreenCaptureByDisplayId(
        screenSymbol,
        { x: 0, y: 0, width: 0, height: 0 },
        captureParam
      );
      rtcEngine.startScreenCapturePreview();
    } else {
      // window
      rtcEngine.videoSourceStartScreenCaptureByWindow(
        screenSymbol,
        {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
        captureParam
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
    const windows = await this.getWindowInfoList();
    const windowIds = windows.map(({ windowId }) => windowId);
    let excludeWindows = [];
    const isCancel = !(await this.modal.showModal(windowIds, (res) => {
      excludeWindows = (res && res.map((windowId) => parseInt(windowId))) || [];
    }));
    if (isCancel) {
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

      await this.startScreenOrWindowCapture(
        type,
        displayId || windowId,
        excludeWindows
      );
    } catch (error) {
      console.log(error);

      message.error('Screen Share Fail');
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
        <img
          src={item.image}
          alt="preview img"
          className={screenStyle.previewShotBig}
        />
      </div>
    );
  };

  renderRightBar = () => {
    const { windowInfoList, screenInfoList, selectedShareInfo, bitrate } =
      this.state;
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
          <DropDownButton
            title="Resolution"
            options={configMapToOptions(ResolutionMap)}
            onPress={(res) => {
              this.setState({ currentResolution: res.dropId });
            }}
          />
          <DropDownButton
            title="FPS"
            options={configMapToOptions(FpsMap)}
            onPress={(res) => {
              this.setState({ currentFps: res.dropId });
            }}
          />
          <SliderBar
            min={50}
            max={2750}
            step={10}
            value={bitrate}
            title="Bitrate"
            onChange={(value) => {
              this.setState({ bitrate: value });
            }}
          />
        </div>
        <JoinChannelBar
          buttonTitle="Start Share"
          buttonTitleDisable="Stop"
          onPressJoin={this.onPressStartShare}
          onPressLeave={this.onPressStopSharing}
        />
        <ChooseFilterWindowModal
          cRef={(ref) => {
            this.modal = ref;
          }}
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
