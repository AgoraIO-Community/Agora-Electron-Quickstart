import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
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
    console.log('audioRecordDevices', audioRecordDevices);

    this.setState({ audioRecordDevices });
  }

  componentWillUnmount() {
    this.rtcEngine?.videoSourceLeave();
    this.rtcEngine?.videoSourceRelease();
    this.rtcEngine?.leaveChannel();
    this.rtcEngine?.release();
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine();
      window.rtcEngine = this.rtcEngine;
      this.subscribeEvents(this.rtcEngine);
      let res = this.rtcEngine.initialize(config.appID);
      console.log('initialize', res);
      this.rtcEngine.setLogFile(config.nativeSDKLogPath);
          this.rtcEngine.setAddonLogFile(config.addonLogPath);
      res = this.rtcEngine.videoSourceInitialize(config.appID);
      console.log('initialize:', res);

      res = this.rtcEngine.videoSourceSetAddonLogFile(config.videoSourceAddonLogPath);
      res = this.rtcEngine.videoSourceSetLogFile(config.nativeSDKVideoSourceLogPath);
    }

    return this.rtcEngine;
  }

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    console.log('---subscribeEvents');

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

    rtcEngine.on('leaveChannel', (rtcStats) => {
      this.setState({
        isJoined: false,
        allUser: [],
      });
    });
    rtcEngine.on('videosourcejoinedsuccess', (uid, channel) => {
      // clearTimeout(timer);
      console.log(`videoSourceJoinChannelSuccess`);

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
      // resolve(uid);
    });

    rtcEngine.on('videoSourceLeaveChannel', (e) => {
      console.log(`videoSourceLeaveChannel`, e);
      this.setState({
        isJoined: false,
        allUser: [],
      });
    });
    rtcEngine.on('error', (err) => {
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
              this.rtcEngine?.videoSourceEnableLoopbackRecording(true,res.dropText);
      
            }}
          />
          <SliderBar
            max={100}
            title="Device Recording Volume"
            onChange={(value) => {
              this.rtcEngine?.videoSourceAdjustRecordingSignalVolume &&
                this.rtcEngine?.videoSourceAdjustRecordingSignalVolume(value);
            }}
          />
          <SliderBar
            max={100}
            title="SDK Recording Volume"
            onChange={(value) => {
              this.rtcEngine?.videoSourceAdjustLoopbackRecordingSignalVolume &&
                this.rtcEngine?.videoSourceAdjustLoopbackRecordingSignalVolume(
                  value
                );
            }}
          />
        </div>
        <JoinChannelBar
          onPressJoin={(channelId) => {
            const rtcEngine = this.getRtcEngine();
            rtcEngine.disableVideo();
            rtcEngine.disableAudio();
            // rtcEngine.setClientRole(1);

            rtcEngine.videoSourceSetChannelProfile(1);
            rtcEngine.videoSourceEnableAudio();
            rtcEngine.videoSourceJoin(
              config.token,
              channelId,
              '',
              Number(`${new Date().getTime()}`.slice(7))
            );
            // rtcEngine.joinChannel();
          }}
          onPressLeave={() => {
            this.getRtcEngine().videoSourceLeave();
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
