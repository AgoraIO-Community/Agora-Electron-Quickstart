import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card, Input } from 'antd';
import config from '../../config/agora.config';
import DropDownButton from '../../component/DropDownButton';
import styles from '../../config/public.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import {
  RoleTypeMap,
  ResolutionMap,
  FpsMap,
  EncryptionMap,
} from '../../config';
import { configMapToOptions } from '../../util';
import Window from '../../component/Window';

interface User {
  isMyself: boolean;
  uid: number;
}

interface State {
  isJoined: boolean;
  channelId: string;
  allUser: User[];
  currentFps?: number;
  encryptionMode?: number;
  encryptionKey?: string;
  currentResolution?: { width: number; height: number };
}

export default class SetEncryption extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    channelId: '',
    allUser: [],
    isJoined: false,
  };

  componentDidMount() {
    this.getRtcEngine().enableVideo();
    this.getRtcEngine().enableAudio();
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

    this.rtcEngine?.setRenderMode(1);

    this.rtcEngine?.joinChannel(
      config.token,
      channelId,
      '',
      Number(`${new Date().getTime()}`.slice(7))
    );
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

  setEncryption = () => {
    const { encryptionKey, encryptionMode } = this.state;
    console.log(
      'encryptionKey, encryptionMode ',
      encryptionKey,
      encryptionMode
    );
    this.getRtcEngine().enableEncryption(true, {
      encryptionKey: encryptionKey! || '',
      encryptionMode: encryptionMode!,
      encryptionKdfSalt: new Uint8Array().buffer,
    });
  };

  renderRightBar = () => {
    // const {  } = this.state;

    return (
      <div className={styles.rightBar}>
        <div>
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
          <DropDownButton
            title="Encryption Mode"
            options={configMapToOptions(EncryptionMap)}
            onPress={(res) => {
              this.setState({ encryptionMode: res.dropId }, this.setEncryption);
            }}
          />
          <p>Encryption Secret</p>
          <Input
            placeholder="Input Encryption Secret"
            onChange={(res) => {
              this.setState(
                { encryptionKey: res.nativeEvent.target.value as string },
                this.setEncryption
              );
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
