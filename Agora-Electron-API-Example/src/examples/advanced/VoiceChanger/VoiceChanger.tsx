import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card } from 'antd';
import config from '../../config/agora.config';
import DropDownButton from '../../component/DropDownButton';
import styles from '../../config/public.scss';
import {
  AudioEffectMap,
  EqualizationReverbMap,
  VoiceBeautifierMap,
} from '../../config';
import { configMapToOptions } from '../../util';
import SliderBar from '../../component/SliderBar';
import JoinChannelBar from '../../component/JoinChannelBar';

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
  audioEffectMode: number;
  equalizationReverbConfig: {
    min: number;
    max: number;
    defaultValue: number;
    audioReverbType: number;
    title: string;
  };
  allUser: User[];
  isJoined: boolean;
  pitchCorrectionParam1: number;
  pitchCorrectionParam2: number;
}

export default class VoiceChanger extends Component<State> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    audioRecordDevices: [],
    audioEffectMode: AudioEffectMap.AUDIO_EFFECT_OFF,
    equalizationReverbConfig: EqualizationReverbMap['Dry Level'],
    allUser: [],
    isJoined: false,
    pitchCorrectionParam1: 1,
    pitchCorrectionParam2: 1,
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

  setAudioEffectParameters = () => {
    const { pitchCorrectionParam2, pitchCorrectionParam1 } = this.state;
    this.getRtcEngine().setAudioEffectParameters(
      AudioEffectMap.PITCH_CORRECTION,
      pitchCorrectionParam1,
      pitchCorrectionParam2
    );
  };

  renderItem = ({ isMyself, uid }) => {
    return (
      <List.Item>
        <Card title={`${isMyself ? 'Local' : 'Remote'} `}>Uid: {uid}</Card>
      </List.Item>
    );
  };

  renderRightBar = () => {
    const {
      audioRecordDevices: audioDevices,
      audioEffectMode,
      equalizationReverbConfig,
    } = this.state;

    return (
      <div className={styles.rightBar}>
        <div>
          <DropDownButton
            title="Microphone"
            options={audioDevices.map((obj) => {
              const { deviceid, devicename } = obj;
              return { dropId: deviceid, dropText: devicename, ...obj };
            })}
            onPress={(res) => {
              this.rtcEngine?.setAudioRecordingDevice(res.dropId);
              // this.rtcEngine?.enableLoopbackRecording(true, res.dropText);
            }}
          />
          <DropDownButton
            title="Voice Beautifier"
            options={configMapToOptions(VoiceBeautifierMap)}
            onPress={(res) => {
              this.rtcEngine?.setVoiceBeautifierPreset(res.dropId);
            }}
          />
          <DropDownButton
            title="Audio Effect"
            options={configMapToOptions(AudioEffectMap)}
            onPress={(res) => {
              const mode = res.dropId;
              this.setState({ audioEffectMode: mode });
              this.rtcEngine?.setAudioEffectPreset(mode);
            }}
          />
          {AudioEffectMap.PITCH_CORRECTION === audioEffectMode && (
            <>
              <SliderBar
                max={3}
                min={1}
                title="PitchCorrection Param 1"
                onChange={(value) => {
                  this.setState(
                    { pitchCorrectionParam1: value },
                    this.setAudioEffectParameters
                  );
                  this.rtcEngine?.adjustRecordingSignalVolume(value);
                }}
              />
              <SliderBar
                max={12}
                min={1}
                title="PitchCorrection Param 2"
                onChange={(value) => {
                  this.setState(
                    { pitchCorrectionParam2: value },
                    this.setAudioEffectParameters
                  );
                }}
              />
            </>
          )}
          <DropDownButton
            title="Equalization Reverb"
            options={configMapToOptions(EqualizationReverbMap)}
            onPress={(res) => {
              this.setState({ equalizationReverbConfig: res.dropId });
            }}
          />
          <SliderBar
            max={equalizationReverbConfig.max}
            min={equalizationReverbConfig.min}
            value={equalizationReverbConfig.defaultValue}
            step={1}
            title={equalizationReverbConfig.title}
            onChange={(value) => {
              this.getRtcEngine().setLocalVoiceReverb(
                equalizationReverbConfig.audioReverbType,
                value
              );
            }}
          />

          <SliderBar
            max={2.0}
            min={0.5}
            step={0.01}
            title="Voice Pitch"
            onChange={(value) => {
              this.getRtcEngine().setLocalVoicePitch(value);
            }}
          />
          <SliderBar
            max={15}
            min={-15}
            step={1}
            title="Equalization Band 31Hz"
            onChange={(value) => {
              // enum AUDIO_EQUALIZATION_BAND_FREQUENCY {
              //   /** 0: 31 Hz */
              //   AUDIO_EQUALIZATION_BAND_31 = 0,
              //   /** 1: 62 Hz */
              //   AUDIO_EQUALIZATION_BAND_62 = 1,
              //   /** 2: 125 Hz */
              //   AUDIO_EQUALIZATION_BAND_125 = 2,
              //   /** 3: 250 Hz */
              //   AUDIO_EQUALIZATION_BAND_250 = 3,
              //   /** 4: 500 Hz */
              //   AUDIO_EQUALIZATION_BAND_500 = 4,
              //   /** 5: 1 kHz */
              //   AUDIO_EQUALIZATION_BAND_1K = 5,
              //   /** 6: 2 kHz */
              //   AUDIO_EQUALIZATION_BAND_2K = 6,
              //   /** 7: 4 kHz */
              //   AUDIO_EQUALIZATION_BAND_4K = 7,
              //   /** 8: 8 kHz */
              //   AUDIO_EQUALIZATION_BAND_8K = 8,
              //   /** 9: 16 kHz */
              //   AUDIO_EQUALIZATION_BAND_16K = 9,
              // };
              this.getRtcEngine().setLocalVoiceEqualization(0, value);
            }}
          />
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
