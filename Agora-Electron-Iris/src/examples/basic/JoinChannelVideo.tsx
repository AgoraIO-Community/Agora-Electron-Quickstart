import React, { Component } from 'react';
import AgoraRtcEngine, {
  AREA_CODE,
  LOG_LEVEL,
  CHANNEL_PROFILE_TYPE,
  AUDIO_PROFILE_TYPE,
  AUDIO_SCENARIO_TYPE,
  RENDER_MODE,
  EngineEvents,
} from 'agora-electron-sdk';
import { List, Card, Radio, Space, message } from 'antd';
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
  /**
   * 1: don't register
   * 2: register before join channel
   * 3: register after join channel
   */
  pluginState: 1 | 2 | 3;
  isJoined: boolean;
  channelId: string;
  allUser: User[];
  audioRecordDevices: Device[];
  cameraDevices: Device[];
  currentFps?: number;
  currentResolution?: { width: number; height: number };
}

const pluginId = 'my-plugin';

export default class JoinChannelVideo extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    /**
     * 1: don't register
     * 2: register before join channel
     * 3: register after join channel
     */
    pluginState: 1,
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

    const registerRes = rtcEngine.registerPlugin({
      pluginId,
      pluginPath: config.pluginPath,
      order: 1,
    });
    console.log(`registerPlugin: registerPlugin  result: ${registerRes}`);
    const enabledRes = rtcEngine.enablePlugin(pluginId, true);
    console.log('registerPlugin: enablePlugin ', enabledRes);
    console.log('----------registerPlugin--------');
  };

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on(EngineEvents.JOINED_CHANNEL, (channel, uid, elapsed) => {
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
    rtcEngine.on(EngineEvents.USER_JOINED, (uid, elapsed) => {
      console.log(`userJoined ---- ${uid}`);

      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser];
      newAllUser.push({ isMyself: false, uid });
      this.setState({
        allUser: newAllUser,
      });
    });
    rtcEngine.on(EngineEvents.USER_OFFLINE, (uid, reason) => {
      console.log(`userOffline ---- ${uid}`);

      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== uid)];
      this.setState({
        allUser: newAllUser,
      });
    });

    rtcEngine.on(EngineEvents.LEAVE_CHANNEL, (rtcStats) => {
      this.setState({
        isJoined: false,
        allUser: [],
      });
    });
    rtcEngine.on(EngineEvents.ERROR, (err) => {
      console.error(err);
    });
  };

  onPressJoinChannel = (channelId: string) => {
    const { pluginState } = this.state;
    if (pluginState === 2) {
      this.registerPlugin();
    }
    this.setState({ channelId });
    this.rtcEngine?.setChannelProfile(
      CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_COMMUNICATION
    );
    this.rtcEngine?.setAudioProfile(
      AUDIO_PROFILE_TYPE.AUDIO_PROFILE_DEFAULT,
      AUDIO_SCENARIO_TYPE.AUDIO_SCENARIO_CHATROOM_ENTERTAINMENT
    );

    this.rtcEngine?.enableDualStreamMode(true);
    this.rtcEngine?.enableAudioVolumeIndication(1000, 3, false);

    this.rtcEngine?.setRenderMode(RENDER_MODE.WEBGL);

    this.rtcEngine?.joinChannel(
      config.token,
      channelId,
      '',
      Number(`${new Date().getTime()}`.slice(7))
    );
    if (pluginState === 3) {
      this.registerPlugin();
    }
  };

  setVideoConfig = () => {
    const { currentFps, currentResolution } = this.state;
    if (!currentResolution || !currentFps) {
      return;
    }
    this.getRtcEngine().setVideoEncoderConfiguration({
      dimensions: currentResolution!,
      frameRate: currentFps!,
      bitrate: 30,
      orientationMode: 0,
      minFrameRate: 10,
      minBitrate: 1,
      degradationPreference: 2,
      mirrorMode: 0,
    });
  };

  renderRightBar = () => {
    const { audioRecordDevices, cameraDevices, pluginState } = this.state;
    return (
      <div className={styles.rightBar}>
        <div>
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
          onPressJoin={this.onPressJoinChannel}
          onPressLeave={() => {
            this.rtcEngine?.unregisterPlugin(pluginId);
            this.rtcEngine?.leaveChannel();
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
