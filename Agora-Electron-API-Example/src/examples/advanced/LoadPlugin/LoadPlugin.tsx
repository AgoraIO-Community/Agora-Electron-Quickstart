import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card, Radio, Space, message } from 'antd';
import config from '../../config/agora.config';
import DropDownButton from '../../component/DropDownButton';
import styles from '../../config/public.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import { RoleTypeMap, ResolutionMap, FpsMap } from '../../config';
import { configMapToOptions } from '../../util';
import Window from '../../component/Window';

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
  audioRecordDevices: Object[];
  cameraDevices: Object[];
  currentFps?: number;
  currentResolution?: { width: number; height: number };
}

const pluginId = 'my-plugin';

export default class LoadPlugin extends Component<{}, State, any> {
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      window.rtcEngine = this.rtcEngine;
      this.subscribeEvents(this.rtcEngine);
      const res = this.rtcEngine.initialize(config.appID, 0xffffffff, {
        level: 0x0001,
        filePath: config.nativeSDKLogPath,
        fileSize: 2000,
      });
      console.log('initialize:', res);
      this.rtcEngine.setAddonLogFile(config.addonLogPath);
    }

    return this.rtcEngine;
  }

  registerPlugin = () => {
    console.log('----------registerPlugin--------');
    console.log('plugin path:', config.pluginPath);

    const rtcEngine = this.getRtcEngine();
    rtcEngine.initializePluginManager();

    if (!config.pluginPath) {
      message.error('Please set plugin path');
    }

    const registerRes = rtcEngine.registerPlugin({
      id: pluginId,
      path: config.pluginPath,
    });
    console.log(`registerPlugin: registerPlugin  result: ${registerRes}`);
    const enabledRes = rtcEngine.enablePlugin(pluginId, true);
    console.log('registerPlugin: enablePlugin ', enabledRes);
    console.log('----------registerPlugin--------');

    const plugin = rtcEngine
      .getPlugins()
      .find((plugin) => plugin.id === pluginId);
    console.log('plugin?.enable', plugin?.enable());
  };

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on('joinedChannel', (channel, uid, elapsed) => {
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
    rtcEngine.on('lastmileProbeResult', (result) => {
      console.log(`lastmileproberesult: ${JSON.stringify(result)}`);
    });
    rtcEngine.on('lastMileQuality', (quality) => {
      console.log(`lastmilequality: ${JSON.stringify(quality)}`);
    });
    rtcEngine.on(
      'audiovolumeindication',
      (uid, volume, speakerNumber, totalVolume) => {
        console.log(
          `uid${uid} volume${volume} speakerNumber${speakerNumber} totalVolume${totalVolume}`
        );
      }
    );
    rtcEngine.on('error', (err) => {
      console.error(err);
    });
  };

  onPressJoinChannel = (channelId: string) => {
    const { pluginState } = this.state;
    if (pluginState === 2) {
      this.registerPlugin();
    }
    this.setState({ channelId });
    this.rtcEngine?.setChannelProfile(1);
    this.rtcEngine?.setAudioProfile(0, 1);

    this.rtcEngine?.enableDualStreamMode(true);
    this.rtcEngine?.enableAudioVolumeIndication(1000, 3, false);

    this.rtcEngine?.setRenderMode(1);
    this.rtcEngine?.enableLocalVideo(true);

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
    const { width, height } = currentResolution;
    this.getRtcEngine().setVideoEncoderConfiguration({
      width,
      height,
      frameRate: currentFps!,
      minFrameRate: 10,
      bitrate: 65,
      minBitrate: 65,
      orientationMode: 0,
      degradationPreference: 2,
      mirrorMode: 0,
    });
  };

  renderRightBar = () => {
    const { audioRecordDevices, cameraDevices, pluginState } = this.state;
    console.log(
      'audioRecordDevices, cameraDevices',
      audioRecordDevices,
      cameraDevices
    );

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
