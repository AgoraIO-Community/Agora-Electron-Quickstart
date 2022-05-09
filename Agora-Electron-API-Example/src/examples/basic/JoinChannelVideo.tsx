import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card } from 'antd';
import config from '../config/agora.config';
import DropDownButton from '../component/DropDownButton';
import styles from '../config/public.scss';
import JoinChannelBar from '../component/JoinChannelBar';
import { RoleTypeMap, ResolutionMap, FpsMap } from '../config';
import { configMapToOptions } from '../util';
import SliderBar from '../component/SliderBar';
import Window from '../component/Window';

interface User {
  isMyself: boolean;
  uid: number;
}

interface State {
  isJoined: boolean;
  channelId: string;
  allUser: User[];
  audioRecordDevices: Object[];
  cameraDevices: Object[];
  currentFps?: number;
  currentResolution?: { width: number; height: number };
  bitrate: number;
}

export default class JoinChannelVideo extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    isJoined: false,
    channelId: '',
    allUser: [],
    audioRecordDevices: [],
    cameraDevices: [],
    bitrate: 50,
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
    this.setState({ channelId });
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

  renderRightBar = () => {
    const { audioRecordDevices, cameraDevices } = this.state;
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
          <SliderBar
            min={50}
            max={2750}
            step={10}
            title="Bitrate"
            onChange={(value) => {
              this.setState({ bitrate: value }, this.setVideoConfig);
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
