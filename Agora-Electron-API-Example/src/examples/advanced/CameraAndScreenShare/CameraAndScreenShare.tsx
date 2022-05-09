import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { Card, message, List } from 'antd';
import config from '../../config/agora.config';
import DropDownButton from '../../component/DropDownButton';
import styles from '../../config/public.scss';
import screenStyle from './CameraAndScreenShare.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import Window from '../../component/Window';
import { readImage } from '../../util/base64';
import SliderBar from '../../component/SliderBar';
import ChooseFilterWindowModal from '../../component/ChooseFilterWindowModal';
import { configMapToOptions } from '../../util';
import { FpsMap, ResolutionMap, RoleTypeMap } from '../../config';

interface State {
  isJoined: boolean;
  allUser: User[];
  currentFps?: number;
  currentResolution?: { width: number; height: number };
  screenInfoList: any[];
  windowInfoList: any[];
  localVideoSourceUid?: number;
  selectedShareInfo?: { type: 'screen' | 'window'; info: any };

  audioRecordDevices: Object[];
  cameraDevices: Object[];
  bitrate: number;

  screenResolution?: { width: number; height: number };
  screenFps?: number;
  screenBitrate: number;
}

const SCREEN_SHARE_ID = 99;

export default class CameraAndScreenShare extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    isJoined: false,
    allUser: [],
    screenInfoList: [],
    windowInfoList: [],

    audioRecordDevices: [],
    cameraDevices: [],
    bitrate: 50,

    screenBitrate: 50,
  };

  componentDidMount = async () => {
    await this.getWindowInfoList();
    await this.getScreenInfoList();
    this.getRtcEngine().enableVideo();
    this.getRtcEngine().enableAudio();
    this.setState({
      audioRecordDevices: this.getRtcEngine().getAudioRecordingDevices(),
      cameraDevices: this.getRtcEngine().getVideoDevices(),
    });
  };

  componentWillUnmount() {
    this.onPressStopSharing();
    this.getRtcEngine().release();
  }

  getScreenInfoList = async () => {
    let myResolve: any;
    const promise = new Promise((resolve, reject) => {
      myResolve = resolve;
    });
    this.getRtcEngine().getScreenDisplaysInfo((list) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      myResolve(list);
    });
    const list = (await promise) as { image: Uint8Array; displayId: number }[];
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

  setVideoConfig = () => {
    const { currentFps, currentResolution, bitrate } = this.state;
    if (!currentResolution || !currentFps) {
      return;
    }
    const { width, height } = currentResolution;
    this.getRtcEngine().setVideoEncoderConfiguration({
      width,
      height,
      frameRate: currentFps!,
      minFrameRate: -1,
      bitrate,
      minBitrate: 1,
      orientationMode: 0,
      degradationPreference: 2,
      mirrorMode: 0,
    });
  };

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on('videoSourceScreenCaptureInfoUpdated', (info) => {
      console.log('videoSourceScreenCaptureInfoUpdated', info);
    });
    rtcEngine.on('joinedChannel', (channel, uid, elapsed) => {
      if (uid === SCREEN_SHARE_ID) {
        console.log(`screen share join ---- ${SCREEN_SHARE_ID}`);
        return;
      }
      console.log(
        `onJoinChannel channel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          rtcEngine.getVersion()
        )})`
      );
      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser];
      newAllUser.push({ isMyself: true, uid });
      this.setState({
        isJoined: true,
        allUser: newAllUser,
      });
    });

    rtcEngine.on('userJoined', (uid, elapsed) => {
      if (uid === SCREEN_SHARE_ID) {
        console.log(`screen share join ---- ${SCREEN_SHARE_ID}`);
        return;
      }
      console.log(`userJoined ---- ${uid}`);

      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser];
      newAllUser.push({ isMyself: false, uid });
      this.setState({
        allUser: newAllUser,
      });
    });
    rtcEngine.on('userOffline', (uid, reason) => {
      console.log(`userOffline ---- ${uid}`);

      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== uid)];
      this.setState({
        allUser: newAllUser,
      });
    });

    rtcEngine.on('leavechannel', (rtcStats) => {
      console.log('leavechannel', rtcStats);

      this.setState({
        isJoined: false,
        allUser: [],
      });
    });

    rtcEngine.on('error', (err) => {
      console.error(err);
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
      screenFps: frameRate,
      screenResolution: { width, height },
      screenBitrate: bitrate,
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

  onPressCameraJoin = (channelId: string) => {
    this.rtcEngine?.setChannelProfile(1);
    this.rtcEngine?.setClientRole(1);
    this.rtcEngine?.setAudioProfile(0, 1);

    this.rtcEngine?.enableDualStreamMode(true);
    this.rtcEngine?.enableAudioVolumeIndication(1000, 3, false);
    this.rtcEngine?.setRenderMode(1);
    this.rtcEngine?.enableVideo();
    this.rtcEngine?.enableLocalVideo(true);

    this.rtcEngine?.joinChannel(
      config.token,
      channelId,
      '',
      Number(`${new Date().getTime()}`.slice(7))
    );
  };

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
      this.onPressCameraJoin(channelId);
    } catch (error) {
      console.log(error);

      message.error('Screen Share Fail');
    }
  };

  onPressStopSharing = () => {
    const rtcEngine = this.getRtcEngine();
    rtcEngine.leaveChannel();
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
    const {
      windowInfoList,
      screenInfoList,
      selectedShareInfo,
      audioRecordDevices,
      cameraDevices,
      screenResolution,
      screenFps,
      screenBitrate,
    } = this.state;
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
          <p>Camere Config:</p>
          <DropDownButton
            options={cameraDevices.map((obj) => {
              const { deviceid, devicename } = obj;
              return { dropId: deviceid, dropText: devicename, ...obj };
            })}
            onPress={(res) => {
              this.getRtcEngine().setVideoDevice(res.dropId);
            }}
            title="Camera"
          />
          <DropDownButton
            title="Microphone"
            options={audioRecordDevices.map((obj) => {
              const { deviceid, devicename } = obj;
              return { dropId: deviceid, dropText: devicename, ...obj };
            })}
            onPress={(res) => {
              this.getRtcEngine().setAudioRecordingDevice(res.dropId);
            }}
          />
          <DropDownButton
            title="Role"
            options={configMapToOptions(RoleTypeMap)}
            onPress={(res) => {
              this.getRtcEngine().setClientRole(res.dropId);
            }}
          />
          <DropDownButton
            title="Resolution"
            options={configMapToOptions(ResolutionMap)}
            onPress={(res) => {
              this.setState(
                { currentResolution: res.dropId },
                this.setVideoConfig
              );
            }}
          />
          <DropDownButton
            title="FPS"
            options={configMapToOptions(FpsMap)}
            onPress={(res) => {
              this.setState({ currentFps: res.dropId }, this.setVideoConfig);
            }}
          />
          <SliderBar
            min={50}
            max={2750}
            step={10}
            title="Bitrate"
            onChange={(value) => {
              this.setState({ bitrate: value }, this.setVideoConfig);
            }}
          />
          <br />
          <p>Screen Share Config:</p>
          <DropDownButton
            title="Resolution"
            options={configMapToOptions(ResolutionMap)}
            onPress={(res) => {
              this.setState({ screenResolution: res.dropId });
            }}
          />
          <DropDownButton
            title="FPS"
            options={configMapToOptions(FpsMap)}
            onPress={(res) => {
              this.setState({ screenFps: res.dropId });
            }}
          />
          <SliderBar
            min={50}
            max={2750}
            step={10}
            value={screenBitrate}
            title="Bitrate"
            onChange={(value) => {
              this.setState({ screenBitrate: value });
            }}
          />
          <p>Please Select a window/scrren to share</p>
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
        <ChooseFilterWindowModal
          cRef={(ref) => {
            this.modal = ref;
          }}
        />
      </div>
    );
  };

  renderItem = ({ isMyself, uid }: User) => {
    const { channelId } = this.state;
    return (
      <List.Item>
        <Card title={`${isMyself ? 'Local' : 'Remote'} Uid: ${uid}`}>
          <Window
            uid={uid}
            rtcEngine={this.rtcEngine!}
            role={isMyself ? 'local' : 'remote'}
            channelId={channelId}
          />
        </Card>
      </List.Item>
    );
  };

  render() {
    const { localVideoSourceUid, isJoined, allUser } = this.state;
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {localVideoSourceUid && (
            <Card title="Local Share" className={styles.card}>
              <Window rtcEngine={this.rtcEngine!} role="localVideoSource" />
            </Card>
          )}
          {isJoined && (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 1,
                lg: 1,
                xl: 1,
                xxl: 2,
              }}
              dataSource={allUser}
              renderItem={this.renderItem}
            />
          )}
        </div>
        {this.renderRightBar()}
      </div>
    );
  }
}
