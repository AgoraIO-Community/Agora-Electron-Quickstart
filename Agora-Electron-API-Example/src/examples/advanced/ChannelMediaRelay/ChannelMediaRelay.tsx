import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card, Input } from 'antd';
import config from '../../config/agora.config';
import styles from '../../config/public.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import Window from '../../component/Window';

const { Search } = Input;

interface User {
  isMyself: boolean;
  uid: number;
}

interface State {
  isJoined: boolean;
  isRelaying: boolean;
  channelId: string;
  allUser: User[];
  currentFps?: number;
  currentResolution?: { width: number; height: number };
}

export default class ChannelMediaRelay extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    channelId: '',
    allUser: [],
    isJoined: false,
    isRelaying: false,
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

    rtcEngine.on('channelMediaRelayState', (state, code) => {
      console.log('channelMediaRelayState: state', state, 'code', code);
    });
    rtcEngine.on('channelMediaRelayEvent', (event) => {
      console.log('channelMediaRelayEvent: event', event);
    });
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

  renderRightBar = () => {
    const { isJoined, isRelaying } = this.state;

    return (
      <div className={styles.rightBar}>
        <div>
          <p>Relay Channel:</p>
          <Search
            placeholder="ChannelName"
            allowClear
            enterButton={!isRelaying ? 'Start Relay' : 'Stop Relay'}
            size="small"
            disabled={!isJoined}
            onSearch={(relayChannnelName) => {
              if (isRelaying) {
                this.getRtcEngine().stopChannelMediaRelay();
              } else {
                const { channelId, allUser } = this.state;
                const self = allUser.filter((user) => user.isMyself)[0];
                this.getRtcEngine().startChannelMediaRelay({
                  srcInfo: { channelName: channelId, uid: self.uid },
                  destInfos: [{ channelName: relayChannnelName }],
                });
              }
              this.setState({ isRelaying: !isRelaying });
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
