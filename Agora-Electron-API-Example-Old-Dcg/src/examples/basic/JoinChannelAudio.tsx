import React, { Component } from 'react';
import AgoraRtcEngine, {
  LOG_LEVEL,
  AREA_CODE,
  CLIENT_ROLE_TYPE,
  EngineEvents,
  CHANNEL_PROFILE_TYPE,
} from 'agora-electron-sdk';
import { List, Card } from 'antd';
import config from '../config/agora.config';
import DropDownButton from '../component/DropDownButton';
import styles from '../config/public.scss';
import { AudioScenarioList, AudioProfileList } from '../config';
import { configMapToOptions } from '../util';
import SliderBar from '../component/SliderBar';
import JoinChannelBar from '../component/JoinChannelBar';

interface User {
  isMyself: boolean;
  uid: number;
}

interface Device {
  devicename: string;
  deviceid: string;
}
interface State {
  audioRecordDevices: Device[];
  audioProfile: number;
  audioScenario: number;
  allUser: User[];
  isJoined: boolean;
}

export default class JoinChannelAudio extends Component<State> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    audioRecordDevices: [],
    audioProfile: AudioProfileList.SpeechStandard,
    audioScenario: AudioScenarioList.Standard,
    allUser: [],
    isJoined: false,
  };

  componentDidMount() {
    const audioRecordDevices =
      this.getRtcEngine().getAudioRecordingDevices() as Device[];
    this.setState({ audioRecordDevices });
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
      const res = this.rtcEngine?.initialize({
        appId: config.appID,
        areaCode: AREA_CODE.AREA_CODE_GLOB,
        logConfig: {
          level: LOG_LEVEL.LOG_LEVEL_INFO,
          filePath: config.nativeSDKLogPath,
          fileSize: 2000,
        },
      });
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

  setAudioProfile = () => {
    const { audioProfile, audioScenario } = this.state;
    this.rtcEngine?.setAudioProfile(audioProfile, audioScenario);
  };

  renderItem = ({ isMyself, uid }) => {
    return (
      <List.Item>
        <Card title={`${isMyself ? 'Local' : 'Remote'} `}>Uid: {uid}</Card>
      </List.Item>
    );
  };

  renderRightBar = () => {
    const { audioRecordDevices: audioDevices } = this.state;
    return (
      <div className={styles.rightBar}>
        <div>
          <DropDownButton
            options={configMapToOptions(AudioProfileList)}
            onPress={(res) =>
              this.setState({ audioProfile: res.dropId }, this.setAudioProfile)
            }
            title="Audio Profile"
          />
          <DropDownButton
            options={configMapToOptions(AudioScenarioList)}
            onPress={(res) =>
              this.setState({ audioScenario: res.dropId }, this.setAudioProfile)
            }
            title="Audio Scenario"
          />
          <DropDownButton
            title="Microphone"
            options={audioDevices.map((obj) => {
              const { deviceid, devicename } = obj;
              return { dropId: deviceid, dropText: devicename, ...obj };
            })}
            onPress={(res) => {
              this.rtcEngine?.setAudioRecordingDevice(res.dropId);
            }}
          />

          <SliderBar
            max={100}
            title="SDK Recording Volume"
            onChange={(value) => {
              this.rtcEngine?.adjustRecordingSignalVolume(value);
            }}
          />
          <SliderBar
            max={100}
            title="Device Playout Volume"
            onChange={(value) => {
              this.rtcEngine?.adjustAudioMixingPlayoutVolume(value);
            }}
          />
          <SliderBar
            max={100}
            title="SDK Playout Volume SDK"
            onChange={(value) => {
              this.rtcEngine?.adjustPlaybackSignalVolume(value);
            }}
          />
        </div>
        <JoinChannelBar
          onPressJoin={(channelId) => {
            const rtcEngine = this.getRtcEngine();
            rtcEngine.disableVideo();
            rtcEngine.enableAudio();
            rtcEngine.setClientRole(CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER);

            this.rtcEngine?.joinChannelEx(
              config.token,
              {
                channelId,
                localUid : Number(`${new Date().getTime()}`.slice(7))
              },
              {
                autoSubscribeAudio: true,
                autoSubscribeVideo: false,
                publishAudioTrack: true,
                publishCameraTrack: false,
                publishScreenTrack: false,
                clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
                channelProfile: CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_LIVE_BROADCASTING,
                encodedVideoTrackOption: { targetBitrate: 600 },
              }
            );
          }}
          onPressLeave={() => {
            this.getRtcEngine().leaveChannel();
          }}
        />
      </div>
    );
  };

  render() {
    const { isJoined, allUser } = this.state;

    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {isJoined && (
            <List
              style={{ width: '100%' }}
              grid={{ gutter: 16, column: 4 }}
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
