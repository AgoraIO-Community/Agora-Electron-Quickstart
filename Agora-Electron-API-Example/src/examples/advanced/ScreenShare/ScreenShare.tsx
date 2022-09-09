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
import { randomInt } from 'crypto';

let screenShareId: number;
interface State {
  currentFps?: number;
  currentResolution?: { width: number; height: number };
  screenInfoList: any[];
  windowInfoList: any[];
  localVideoSourceUid?: number;
  selectedShareInfo?: { type: 'screen' | 'window'; info: any };
  shared: boolean;
}

export default class ScreenShare extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    screenInfoList: [],
    windowInfoList: [],
    shared: false,
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
    let list = this.getRtcEngine().getScreenCaptureSources(
      { width: 400, height: 400 },
      { width: 400, height: 400 },
      true
    ).filter(obj => obj.type === 1);
    console.log('getScreenCaptureSources\n', list);
    Promise.all(list.map(item => readImage(item.thumbImage.buffer))).then(
      imageList => {
        console.log('imageList\n', imageList);
        let displayList = list.map((item, index) => {
          return {
            ownerName: item.sourceTitle,
            name: item.sourceName,
            displayId: { x: 0, y: 0, width: 400, height: 400, id: item.sourceId },
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
    let list = this.getRtcEngine().getScreenCaptureSources(
      { width: 400, height: 400 },
      { width: 400, height: 400 },
      true
    ).filter(obj => obj.type === 0);
    console.log('getScreenCaptureSources\n', list);
    Promise.all(list.map(item => readImage(item.thumbImage.buffer))).then(
      imageList => {
        console.log('imageList\n', imageList);
        let windowList = list.map((item, index) => {
          return {
            ownerName: item.sourceTitle,
            name: item.sourceName,
            windowId: item.sourceId,
            image: imageList[index],
          };
        });
        this.setState({
          windowInfoList: windowList,
        });
      }
    );

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
      const res = this.rtcEngine.initialize(config.appID, 0xffffffff, {
        fileSizeInKB: 2048,
        level: 0x0001,
        filePath: config.nativeSDKLogPath,
      });
      console.log('initialize:', res);
      this.rtcEngine.setAddonLogFile(config.addonLogPath);
    }

    return this.rtcEngine;
  }

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on('joinedChannel', (connection, elapsed) => {
      console.log(
        `onJoinChannel channel: ${connection.channelId}  uid: ${connection.localUid
        }  version: ${JSON.stringify(rtcEngine.getVersion())})`
      );

      console.log('localVideoSourceUid', connection.localUid);
      this.setState({
        localVideoSourceUid: connection.localUid,
      });
    });
    rtcEngine.on('userJoined', (uid, elapsed) => {
      console.log(`userJoined ---- ${uid}`);
    });
    rtcEngine.on('userOffline', (uid, reason) => { });

    rtcEngine.on('error', (err) => {
      console.error(err);
    });
  };

  startScreenOrWindowCapture = (type: string, screenSymbol: any) => {
    const rtcEngine = this.getRtcEngine();
    console.log(`start sharing display ${JSON.stringify(screenSymbol)}`);
    const excludeList = new Array<number>();

    if (type === 'screen') {
      try {
        rtcEngine.startScreenCaptureByDisplayId(
          screenSymbol.id,
          { x: 0, y: 0, width: 0, height: 0 },
          {
            width: 480,
            height: 360,
            bitrate: 1000,
            frameRate: 15,
            captureMouseCursor: false,
            windowFocus: false,
            excludeWindowList: [],
          }
        );
        console.log('startScreenCaptureByDisplayId');
      } catch (error) {
        rtcEngine.startScreenCaptureByScreen(
          screenSymbol,
          { x: 0, y: 0, width: 0, height: 0 },
          {
            width: 480,
            height: 360,
            bitrate: 1000,
            frameRate: 15,
            captureMouseCursor: false,
            windowFocus: false,
            excludeWindowList: [],
          }
        );
        console.log('startScreenCaptureByScreen');
      }

    } else {
      const info = this.state.windowInfoList.find((obj) => {
        if (obj.windowId === screenSymbol) return obj;
      });
      console.log('startScreenCaptureByWindow', info);

      const res = rtcEngine.startScreenCaptureByWindow(
        screenSymbol,
        {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
        {
          width: 480,
          height: 360,
          bitrate: 2000,
          frameRate: 15,
          captureMouseCursor: true,
          windowFocus: false,
          excludeWindowList: excludeList,
        }
      );
      console.log('startScreenCaptureByWindow:', res);
    }
  };

  joinChannel = (
    channelId: string,
    info = '',
    timeout = 5000
  ): Promise<boolean> =>
    new Promise((resolve, reject) => {
      screenShareId = randomInt(1, 9999999);
      const timer = setTimeout(() => {
        reject(new Error('Join Channel Timeout'));
      }, timeout);
      const rtcEngine = this.getRtcEngine();
      rtcEngine.once('joinedChannel', (connection, elapsed) => {
        clearTimeout(timer);
        if (screenShareId !== connection.localUid) {
          return;
        }
        resolve(true);
        console.log(
          `onJoinChannel channel: ${connection.channelId}  uid: ${connection.localUid
          }  version: ${JSON.stringify(rtcEngine.getVersion())})`
        );
      });

      try {
        console.log(`localUid: ${screenShareId}`);
        this.rtcEngine?.joinChannelEx(
          config.token,
          {
            channelId,
            localUid: screenShareId,
          },
          {
            publishCameraTrack: false,
            publishAudioTrack: false,
            publishScreenTrack: true,
            publishCustomAudioTrack: false,
            publishCustomVideoTrack: false,
            publishEncodedVideoTrack: false,
            publishMediaPlayerAudioTrack: false,
            publishMediaPlayerVideoTrack: false,
            autoSubscribeAudio: false,
            autoSubscribeVideo: false,
            clientRoleType: 1,

            publishSecondaryCameraTrack: false,
            publishMediaPlayerId: 0,
            enableAudioRecordingOrPlayout: false,
            defaultVideoStreamType: 0,
            channelProfile: 1,
          }
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

    try {
      await this.startScreenOrWindowCapture(type, displayId || windowId);
      const res = await this.joinChannel(channelId);
      return false;
    } catch (error) {
      console.error(error);
    }
    return true;
  };

  onPressStopSharing = () => {
    const shared = this.state;
    if (shared) {
      const rtcEngine = this.getRtcEngine();
      rtcEngine.stopScreenCapture();
      rtcEngine.leaveChannel();
      this.setState({ localVideoSourceUid: undefined, shared: false });
    }
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
          buttonTitleDisable="Stop Share"
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
