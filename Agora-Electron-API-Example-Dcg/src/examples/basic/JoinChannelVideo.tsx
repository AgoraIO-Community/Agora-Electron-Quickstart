import React, { Component } from 'react';
import AgoraRtcEngine, {
  AREA_CODE,
  LOG_LEVEL,
  CHANNEL_PROFILE_TYPE,
  AUDIO_PROFILE_TYPE,
  AUDIO_SCENARIO_TYPE,
  RENDER_MODE,
  EngineEvents,
  VIDEO_CODEC_TYPE,
  ORIENTATION_MODE,
  DEGRADATION_PREFERENCE,
  VIDEO_MIRROR_MODE_TYPE,
  VIDEO_SOURCE_TYPE,
  FRAME_RATE,
  CLIENT_ROLE_TYPE,
} from 'agora-electron-sdk';
import { List, Card } from 'antd';
import config from '../config/agora.config';
import DropDownButton from '../component/DropDownButton';
import styles from '../config/public.scss';
import JoinChannelBar from '../component/JoinChannelBar';
import { RoleTypeMap, ResolutionMap, FpsMap } from '../config';
import { configMapToOptions } from '../util';
import Window from '../component/Window';

interface Device {
  devicename: string;
  deviceid: string;
}
interface User {
  isMyself: boolean;
  uid: number;
}

interface State {
  isJoined: boolean;
  channelId: string;
  allUser: User[];
  audioRecordDevices: Device[];
  cameraDevices: Device[];
  currentFps?: number;
  currentResolution?: { width: number; height: number };
}

export default class JoinChannelVideo extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    channelId: '',
    allUser: [],
    isJoined: false,
    audioRecordDevices: [],
    cameraDevices: [],
  };

  componentDidMount() {
    this.getRtcEngine().enableVideo();
    this.getRtcEngine().enableAudio();
    this.setState({
      audioRecordDevices: this.getRtcEngine().getAudioRecordingDevices(),
      cameraDevices: this.getRtcEngine().getVideoDevices(),
    });
  }

  componentWillUnmount() {
    this.rtcEngine?.leaveChannel();
    this.rtcEngine?.release();
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      window.rtcEngine = this.rtcEngine;
      this.subscribeEvents(this.rtcEngine);
      const res = this.rtcEngine.initialize({
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

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on(EngineEvents.JOINED_CHANNEL, ({ channelId }, uid) => {
      console.log(
        `onJoinChannel channel: ${channelId}  uid: ${uid}  version: ${JSON.stringify(
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
    rtcEngine.on(EngineEvents.USER_JOINED, (connection, uid, elapsed) => {
      console.log(`userJoined ---- ${uid}`);

      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser];
      newAllUser.push({ isMyself: false, uid });
      this.setState({
        allUser: newAllUser,
      });
    });
    rtcEngine.on(EngineEvents.USER_OFFLINE, (connection, uid, reason) => {
      console.log(`userOffline ---- ${uid}`);

      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== uid)];
      this.setState({
        allUser: newAllUser,
      });
    });

    rtcEngine.on(EngineEvents.LEAVE_CHANNEL, (connection, rtcStats) => {
      this.setState({
        isJoined: false,
        allUser: [],
      });
    });
    rtcEngine.on(EngineEvents.ERROR, (err, msg) => {
      console.error(err);
    });
  };

  onPressJoinChannel = (channelId: string) => {
    this.setState({ channelId });
    this.rtcEngine?.setChannelProfile(
      CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_COMMUNICATION
    );
    this.rtcEngine?.setAudioProfile(
      AUDIO_PROFILE_TYPE.AUDIO_PROFILE_DEFAULT,
      AUDIO_SCENARIO_TYPE.AUDIO_SCENARIO_CHATROOM_ENTERTAINMENT
    );

    // this.rtcEngine?.enableDualStreamMode(true);
    // this.rtcEngine?.enableAudioVolumeIndication(1000, 3, false);

    this.rtcEngine?.setRenderMode(RENDER_MODE.SOFTWARE);

    this.rtcEngine?.joinChannel(
      config.token,
      channelId,
      '',
      Number(`${new Date().getTime()}`),
      {
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
        publishAudioTrack: true,
        publishCameraTrack: true,
        publishScreenTrack: false,
        clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
        channelProfile: CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_LIVE_BROADCASTING,
        encodedVideoTrackOption: { targetBitrate: 600 },
      }
    );
  };

  setVideoConfig = () => {
    const { currentFps, currentResolution } = this.state;
    if (!currentResolution || !currentFps) {
      return;
    }
    this.getRtcEngine().setVideoEncoderConfiguration({
      codecType: VIDEO_CODEC_TYPE.VIDEO_CODEC_H264,
      dimensions: currentResolution!,
      frameRate: currentFps!,
      bitrate: 540,
      minBitrate: 100,
      orientationMode: ORIENTATION_MODE.ORIENTATION_MODE_ADAPTIVE,
      degradationPreference: DEGRADATION_PREFERENCE.MAINTAIN_BALANCED,
      mirrorMode: VIDEO_MIRROR_MODE_TYPE.AUTO,
    });
  };

  renderRightBar = () => {
    const { audioRecordDevices, cameraDevices } = this.state;
    return (
      <div className={styles.rightBar}>
        <div>
          <DropDownButton
            options={cameraDevices.map((obj) => {
              const { deviceid, devicename } = obj;
              return { dropId: deviceid, dropText: devicename, ...obj };
            })}
            onPress={(res) => {
              this.getRtcEngine().startPrimaryCameraCapture({
                deviceId: res.dropId,
                format: {
                  width: 1080,
                  height: 720,
                  fps: FRAME_RATE.FRAME_RATE_FPS_60,
                },
              });
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
        </div>
        <JoinChannelBar
          onPressJoin={this.onPressJoinChannel}
          onPressLeave={() => {
            this.rtcEngine?.leaveChannel();
          }}
        />
      </div>
    );
  };

  renderItem = ({ isMyself, uid }: User) => {
    const { channelId } = this.state;
    const videoSourceType = isMyself
      ? VIDEO_SOURCE_TYPE.VIDEO_SOURCE_CAMERA_PRIMARY
      : VIDEO_SOURCE_TYPE.VIDEO_SOURCE_REMOTE;
    return (
      <List.Item>
        <Card title={`${isMyself ? 'Local' : 'Remote'} Uid: ${uid}`}>
          <Window
            uid={uid}
            rtcEngine={this.rtcEngine!}
            videoSourceType={videoSourceType}
            channelId={channelId}
          />
        </Card>
      </List.Item>
    );
  };

  render() {
    const { isJoined, allUser } = this.state;
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
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
