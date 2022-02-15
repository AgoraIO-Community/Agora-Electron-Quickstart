import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card, Input, Checkbox, Button, message } from 'antd';
import config from '../../config/agora.config';
import styles from '../../config/public.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import Window from '../../component/Window';

interface User {
  isMyself: boolean;
  uid: number;
}

interface State {
  isJoined: boolean;
  channelId: string;
  allUser: User[];
  isTranscoding: boolean;
  url: string;
  currentResolution?: { width: number; height: number };
}

export default class SetLiveTranscoding extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    channelId: '',
    url: '',
    allUser: [],
    isJoined: false,
    isTranscoding: false,
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

  onPressStart = () => {
    const { url, isTranscoding } = this.state;
    if (!url || !url.startsWith('rtmp://') || url === 'rtmp://') {
      message.error("RTMP URL cannot be empty or not start with 'rtmp://'");
      return;
    }
    let res;
    if (isTranscoding) {
      const transcoding = {
        audioBitrate: 48,
        audioChannels: 1,
        audioCodecProfile: 1,
        audioSampleRate: 44100,
        backgroundColor: 12632256,
        backgroundImage: [],
        height: 720,
        lowLatency: false,
        transcodingExtraInfo: '',
        watermark: [],
        videoBitrate: 1130,
        videoCodecProfile: 100,
        videoFrameRate: 15,
        videoGop: 30,
        width: 1280,
        transcodingUsers: [],
      };
      res = this.getRtcEngine().updateRtmpTranscoding(transcoding);
      console.log('updateRtmpTranscoding', res);
      res = this.getRtcEngine().startRtmpStreamWithTranscoding(
        url,
        transcoding
      );
      console.log('startRtmpStreamWithTranscoding', res);
      return;
    }
    res = this.getRtcEngine().startRtmpStreamWithoutTranscoding(url);
    console.log('startRtmpStreamWithoutTranscoding', res);
  };

  onPressStop = () => {
    const { url } = this.state;
    const res = this.getRtcEngine().stopRtmpStream(url);
    console.log('stopRtmpStream', res);
  };

  renderRightBar = () => {
    const { isTranscoding } = this.state;

    return (
      <div className={styles.rightBar}>
        <div>
          <p>rtmp</p>
          <Input
            placeholder="rtmp://"
            defaultValue="rtmp://"
            onChange={(res) => {
              this.setState({
                url: res.nativeEvent.target.value as string,
              });
            }}
          />
          <Checkbox
            onChange={() => {
              this.setState({ isTranscoding: !isTranscoding });
            }}
            checked={isTranscoding}
          >
            Transcoding
          </Checkbox>
          <br />
          <Button onClick={this.onPressStart}>Start Rtmp Stream</Button>
          <br />
          <Button onClick={this.onPressStart}>Stop Rtmp Stream</Button>
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
