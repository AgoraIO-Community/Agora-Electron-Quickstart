import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card, Input } from 'antd';
import config from '../../config/agora.config';
import styles from '../../config/public.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import createDataStreamStyle from './CreateDataStream.scss';

const { Search } = Input;
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
  msgs: string[];
}

export default class CreateDataStream extends Component<State> {
  rtcEngine?: AgoraRtcEngine;

  streamId?: number;

  state: State = {
    allUser: [],
    isJoined: false,
    msgs: [],
  };

  componentDidMount() {}

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
    rtcEngine.on('streamMessage', (uid, streamId, msg, len) => {
      this.setState({
        msgs: [...this.state.msgs, `from:${uid} message:${msg}`],
      });
      console.log('received message: ', uid, streamId, msg);
    });
  };

  getStreamId = () => {
    if (!this.streamId) {
      this.streamId = this.rtcEngine?.createDataStreamWithConfig({
        syncWithAudio: false,
        ordered: true,
      });
    }

    return this.streamId!;
  };

  pressSendMsg = (msg: string) => {
    // create the data stream
    // Each user can create up to five data streams during the lifecycle of the agoraKit
    this.rtcEngine?.sendStreamMessage(this.getStreamId(), msg);
    console.log('streamId:', this.streamId, ' content:', msg);
  };

  renderItem = ({ isMyself, uid }) => {
    return (
      <List.Item>
        <Card title={`${isMyself ? 'Local' : 'Remote'} `}>Uid: {uid}</Card>
      </List.Item>
    );
  };

  renderRightBar = () => {
    const { isJoined, msgs } = this.state;
    return (
      <div className={styles.rightBarBig}>
        <div className={createDataStreamStyle.toolBarContent}>
          <div>
            <p>Received Messages:</p>
            <div className={createDataStreamStyle.msgList}>
              {msgs.map((msg, index) => (
                <div key={index} className={createDataStreamStyle.msg}>
                  {msg}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p>Send Message:</p>
            <Search
              placeholder="input msg text"
              enterButton="Send"
              size="middle"
              onSearch={this.pressSendMsg}
              disabled={!isJoined}
            />
          </div>
        </div>
        <JoinChannelBar
          onPressJoin={(channelId) => {
            const rtcEngine = this.getRtcEngine();
            rtcEngine.disableVideo();
            rtcEngine.disableAudio();
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
