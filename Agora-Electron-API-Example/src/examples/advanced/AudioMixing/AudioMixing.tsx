import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card, Input, Button } from 'antd';
import config from '../../config/agora.config';
import styles from '../../config/public.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import Window from '../../component/Window';
import SliderBar from '../../component/SliderBar';
import { AudioProfileList, AudioScenarioList } from '../../config';
import DropDownButton from '../../component/DropDownButton';
import { configMapToOptions, getResourcePath } from '../../util';

const EFFECT_ID = 1;
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

    console.log(
      'audioRecordDevices',
      this.getRtcEngine().getAudioRecordingDevices()
    );

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
      const res = this.rtcEngine.initialize(config.appID, 0xffffffff, {
        level: 0x0001,
        filePath: config.nativeSDKLogPath,
        fileSize: 2000,
      });
      console.log('initialize', res);
      this.rtcEngine.setAddonLogFile(config.addonLogPath);
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
      <div className={styles.rightBar} style={{ width: '60%' }}>
        <div style={{ overflow: 'auto' }}>
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
            title="Mixing Volume"
            onChange={(value) => {
              this.rtcEngine?.adjustAudioMixingVolume(value);
            }}
          />
          <SliderBar
            max={100}
            title="Mixing Playback Volume"
            onChange={(value) => {
              this.rtcEngine?.adjustAudioMixingPlayoutVolume(value);
            }}
          />
          <SliderBar
            max={100}
            title="Mixing Publish Volume"
            onChange={(value) => {
              this.rtcEngine?.adjustAudioMixingPublishVolume(value);
            }}
          />
          <p>Audio Effect Controls</p>
          <Button
            htmlType="button"
            onClick={() => {
              this.getRtcEngine().playEffect(
                EFFECT_ID,
                getResourcePath('audioEffect.mp3'),
                -1,
                1,
                0,
                100,
                true,
                0
              );
            }}
          >
            Play
          </Button>
          <Button
            htmlType="button"
            onClick={() => {
              this.getRtcEngine().resumeEffect(EFFECT_ID);
            }}
          >
            Resume
          </Button>
          <Button
            htmlType="button"
            onClick={() => {
              this.getRtcEngine().pauseEffect(EFFECT_ID);
            }}
          >
            Pause
          </Button>
          <Button
            htmlType="button"
            onClick={() => {
              this.getRtcEngine().stopEffect(EFFECT_ID);
            }}
          >
            Stop
          </Button>
          <SliderBar
            max={100}
            title="Effect Volume"
            onChange={(value) => {
              this.getRtcEngine().setEffectsVolume(value);
            }}
          />
          <SliderBar
            max={100}
            title="Loopback Recording Volume"
            onChange={(value) => {
              this.rtcEngine?.adjustLoopbackRecordingSignalVolume(value);
            }}
          />
          <Button
            htmlType="button"
            onClick={() => {
              this.getRtcEngine().enableLoopbackRecording(true);
            }}
          >
            enable
          </Button>
          <Button
            htmlType="button"
            onClick={() => {
              this.getRtcEngine().enableLoopbackRecording(false);
            }}
          >
            disable
          </Button>
        </div>
        <JoinChannelBar
          onPressJoin={(channelId) => {
            const rtcEngine = this.getRtcEngine();
            rtcEngine.disableVideo();
            rtcEngine.enableAudio();
            rtcEngine.setClientRole(1);

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
