import React, { Component } from 'react';
import AgoraRtcEngine, {
  LOG_LEVEL,
  AREA_CODE,
  CLIENT_ROLE_TYPE,
  EngineEvents,
} from 'agora-electron-sdk';
import { List, Card } from 'antd';
import config from '../../agora.config';
import DropDownButton from '../component/DropDownButton';
import styles from './index.scss';
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
      this.subscribeEvents(this.rtcEngine);
      const res = this.rtcEngine?.initializeWithContext({
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
            max={255}
            title="Device Recording Volume"
            onChange={(value) => {
              this.rtcEngine?.setAudioRecordingVolume(value);
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

            rtcEngine.joinChannel(
              config.token,
              channelId,
              '',
              Number(`${new Date().getTime()}`.slice(7))
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
