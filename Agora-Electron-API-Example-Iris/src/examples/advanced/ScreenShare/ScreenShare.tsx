import React, { Component } from 'react';
import AgoraRtcEngine, {
  ScreenSymbol,
  AREA_CODE,
  LOG_LEVEL,
  EngineEvents,
  VideoSourceEvents,
  VIDEO_PROFILE_TYPE,
} from 'agora-electron-sdk';
import { Card, message, Radio, Space } from 'antd';
import config from '../../config/agora.config';
import DropDownButton from '../../component/DropDownButton';
import styles from '../../config/public.scss';
import screenStyle from './ScreenShare.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import Window from '../../component/Window';
import { readImage } from '../../util/base64';

interface State {
  /**
   * 1: don't register
   * 2: register before join channel
   * 3: register after join channel
   */

  pluginState: 1 | 2 | 3;
  currentFps?: number;
  currentResolution?: { width: number; height: number };
  screenInfoList: any[];
  windowInfoList: any[];
  localVideoSourceUid?: number;
  selectedShareInfo?: { type: 'screen' | 'window'; info: any };
}

const SCREEN_SHARE_ID = 99;
const pluginId = 'my-plugin';

export default class ScreenShare extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    /**
     * 1: don't register
     * 2: register before join channel
     * 3: register after join channel
     */
    pluginState: 1,
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
    const list = this.getRtcEngine().getScreensInfo();
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
    const list = this.getRtcEngine().getWindowsInfo();

    const imageListPromise = list.map((item) => readImage(item.image));
    const imageList = await Promise.all(imageListPromise);

    const windowInfoList = list.map(({ ownerName, name, windowId }, index) => ({
      ownerName,
      image: imageList[index],
      windowId,
      name:
        name.length < 20
          ? name
          : name.replace(/\s+/g, '').substr(0, 20) + '...',
    }));
    this.setState({ windowInfoList });
  };

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      window.rtcEngine = this.rtcEngine;
      this.subscribeEvents(this.rtcEngine);
      const res = this.rtcEngine.initializeWithContext({
        appId: config.appID,
        areaCode: AREA_CODE.AREA_CODE_GLOB,
        logConfig: {
          level: LOG_LEVEL.LOG_LEVEL_INFO,
          filePath: config.nativeSDKLogPath,
          fileSize: 2000,
        },
      });
      this.rtcEngine.setAddonLogFile(config.addonLogPath);
      console.log('initialize:', res);
    }
    return this.rtcEngine;
  }

  registerPlugin = () => {
    console.log('----------registerPlugin--------');
    const rtcEngine = this.getRtcEngine();
    if (!config.pluginPath) {
      message.error('Please set plugin path');
    }

    const registerRes = rtcEngine.videoSourceRegisterPlugin({
      pluginId,
      pluginPath: config.pluginPath,
      order: 1,
    });
    console.log(
      `registerPlugin: videoSourceRegisterPlugin  result: ${registerRes}`
    );
    const enabledRes = rtcEngine.videoSourceEnablePlugin(pluginId, true);
    console.log('registerPlugin:videoSourceEnablePlugin ', enabledRes);
    console.log('----------registerPlugin--------');
  };

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on(EngineEvents.JOINED_CHANNEL, (channel, uid, elapsed) => {
      console.log(
        `onJoinChannel channel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          rtcEngine.getVersion()
        )})`
      );
    });
    rtcEngine.on(EngineEvents.USER_JOINED, (uid, elapsed) => {
      if (uid === SCREEN_SHARE_ID) {
        console.log(`screen share join ---- ${SCREEN_SHARE_ID}`);
        return;
      }
      console.log(`userJoined ---- ${uid}`);
    });
    rtcEngine.on(EngineEvents.USER_OFFLINE, (uid, reason) => {});

    rtcEngine.on(EngineEvents.ERROR, (err) => {
      console.error(err);
    });
    rtcEngine.on(
      EngineEvents.FIRST_LOCAL_VIDEO_FRAME,
      (width, height, elapsed) => {
        console.log(`firstLocalVideoFrame width: ${width}, ${height}`);
      }
    );
    rtcEngine.on(VideoSourceEvents.VIDEO_SOURCE_API_CALL_EXECUTED, (api, err) =>
      console.log(`videoSourceApiCallExecuted ${api} ${err}`)
    );
  };

  initializeVideoSource = () => {
    const rtcEngine = this.getRtcEngine();
    rtcEngine.videoSourceInitializeWithContext({
      appId: config.appID,
      areaCode: AREA_CODE.AREA_CODE_GLOB,
      logConfig: {
        level: LOG_LEVEL.LOG_LEVEL_INFO,
        filePath: config.nativeSDKVideoSourceLogPath,
        fileSize: 2000,
      },
    });
    rtcEngine.videoSourceEnableVideo();
    rtcEngine.videoSourceEnableAudio();
  };

  startScreenOrWindowCapture = (type: string, screenSymbol: ScreenSymbol) => {
    const rtcEngine = this.getRtcEngine();
    // rtcEngine.startScreenCapture2(windowId, captureFreq, rect, bitrate);
    // there's a known limitation that, videosourcesetvideoprofile has to be called at least once
    // note although it's called, it's not taking any effect, to control the screenshare dimension, use captureParam instead
    console.log(`start sharing display ${JSON.stringify(screenSymbol)}`);
    rtcEngine.videoSourceSetVideoProfile(43, false);

    const excludeList = new Array<number>();
    if (type === 'screen') {
      rtcEngine.videoSourceStartScreenCaptureByScreen(
        screenSymbol,
        { x: 0, y: 0, width: 0, height: 0 },
        {
          dimensions: { width: 0, height: 0 },
          bitrate: 500,
          frameRate: 5,
          captureMouseCursor: true,
          windowFocus: false,
          excludeWindowList: excludeList,
          excludeWindowCount: excludeList.length,
        }
      );
      rtcEngine.videoSourceStartPreview();
    } else {
      // window

      // const pix = window.devicePixelRatio;
      // const value = 100;
      // const resultValue = pix * value;
      rtcEngine.videoSourceStartScreenCaptureByWindow(
        screenSymbol,
        {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
        {
          dimensions: { width: 0, height: 0 },
          bitrate: 500,
          frameRate: 15,
          captureMouseCursor: true,
          windowFocus: false,
          excludeWindowList: excludeList,
          excludeWindowCount: excludeList.length,
        }
      );
      rtcEngine.videoSourceStartPreview();
    }
  };

  startWindowShare = (windowId = 0) => {
    const rtcEngine = this.getRtcEngine();
    // rtcEngine.startScreenCapture2(windowId, captureFreq, rect, bitrate);
    // there's a known limitation that, videosourcesetvideoprofile has to be called at least once
    // note although it's called, it's not taking any effect, to control the screenshare dimension, use captureParam instead
    rtcEngine.videoSourceSetVideoProfile(
      VIDEO_PROFILE_TYPE.VIDEO_PROFILE_LANDSCAPE_480P_4,
      false
    );
    const pix = window.devicePixelRatio;
    const value = 100;
    const resultValue = pix * value;
    const excludeList = new Array<number>();
    rtcEngine.videoSourceStartScreenCaptureByWindow(
      windowId,
      {
        x: resultValue,
        y: resultValue,
        width: resultValue,
        height: resultValue,
      },
      {
        dimensions: { width: 0, height: 0 },
        bitrate: 500,
        frameRate: 15,
        captureMouseCursor: false,
        windowFocus: false,
        excludeWindowList: excludeList,
        excludeWindowCount: excludeList.length,
      }
    );
    rtcEngine.videoSourceStartPreview();
  };

  videoSourceJoinChannel = (
    channelId: string,
    info = '',
    timeout = 5000
  ): Promise<number> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Join Channel Timeout'));
      }, timeout);
      const rtcEngine = this.getRtcEngine();
      rtcEngine.once(
        VideoSourceEvents.VIDEO_SOURCE_JOIN_CHANNEL_SUCCESS,
        (uid) => {
          clearTimeout(timer);
          console.log(`videoSourceJoinChannelSuccess`);
          resolve(uid);
        }
      );

      rtcEngine.once(VideoSourceEvents.VIDEO_SOURCE_LEAVE_CHANNEL, () => {
        console.log(`videoSourceLeaveChannel`);
      });
      try {
        rtcEngine.videoSourceJoinChannel(
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
    const { selectedShareInfo, pluginState } = this.state;

    if (!selectedShareInfo) {
      message.error('Must select a window/screen to share');
      return true;
    }

    const {
      info: { displayId, windowId },
      type,
    } = selectedShareInfo;

    this.initializeVideoSource();
    if (pluginState === 2) {
      this.registerPlugin();
    }
    try {
      const localVideoSourceUid = await this.videoSourceJoinChannel(channelId);
      this.setState({
        localVideoSourceUid,
      });
      await this.startScreenOrWindowCapture(type, displayId || windowId);
      if (pluginState === 3) {
        this.registerPlugin();
      }
    } catch (error) {
      message.error(error);
    }
  };

  onPressStopSharing = () => {
    const rtcEngine = this.getRtcEngine();
    rtcEngine.setView({
      user: 'videoSource',
      view: undefined,
    });
    rtcEngine.videoSourceUnregisterPlugin(pluginId);
    rtcEngine.videoSourceStopScreenCapture();
    rtcEngine.videoSourceLeaveChannel();
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
    const { windowInfoList, screenInfoList, selectedShareInfo, pluginState } =
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

          <div className={styles.selectedItem}>
            (Optional) Register custom plugin
          </div>
          <Radio.Group
            onChange={({ target: { value } }) => {
              this.setState({ pluginState: value });
            }}
            value={pluginState}
          >
            <Space direction="vertical">
              <Radio value={1}>Don&apos;t register plugin</Radio>
              <Radio value={2}>Plugin register before join</Radio>
              <Radio value={3}>Plugin register after join</Radio>
            </Space>
          </Radio.Group>
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
