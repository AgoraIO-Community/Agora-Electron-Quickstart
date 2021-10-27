import React, { Component } from 'react';
import AgoraRtcEngine, {
  AREA_CODE,
  LOG_LEVEL,
  AgoraRtcChannel,
  ChannelEvents,
} from 'agora-electron-sdk';
import { List, Card, Button } from 'antd';
import config from '../../config/agora.config';

import styles from '../../config/public.scss';

interface State {
  channels: AgoraRtcChannel[];
}

export default class JoinChannelVideo extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    channels: [],
  };

  componentDidMount() {}

  componentWillUnmount() {
    this.rtcEngine?.release();
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine();
      const res = this.rtcEngine.initializeWithContext({
        appId: config.appID,
        areaCode: AREA_CODE.AREA_CODE_GLOB,
        logConfig: {
          level: LOG_LEVEL.LOG_LEVEL_INFO,
          filePath: config.nativeSDKLogPath,
          fileSize: 2000,
        },
      });
      this.rtcEngine.setAddonLogFile(config.addonLogPath);
      console.log('initialize:', res);
    }

    return this.rtcEngine;
  }

  subscribeEvents = (channel: AgoraRtcChannel) => {
    channel.on(
      ChannelEvents.JOIN_CHANNEL_SUCCESS,
      (channelId, uid, elapsed) => {
        console.log(
          `joinChannelSuccess: ${channelId} uid:${uid},elapsed:${elapsed}`
        );
      }
    );
    channel.on(ChannelEvents.LEAVE_CHANNEL, (channelId, stats) => {
      const { channels } = this.state;
      console.log(`leaveChannel: ${channelId}`, stats);
      this.setState({
        channels: channels.filter((c) => c.channelId() !== channelId),
      });
    });
    channel.on(ChannelEvents.CHANNEL_ERROR, (channelId, err, msg) => {
      console.log(`channelError: ${channelId}`, channelId, err, msg);
    });
    channel.on(ChannelEvents.CHANNEL_WARNING, (channelId, wran, msg) => {
      console.log(`channelError: ${channelId}`, channelId, wran, msg);
    });
    channel.on(ChannelEvents.USER_JOINED, (channelId, uid, elapsed) => {
      console.log(`userJoined: ${channelId}`, uid, elapsed);
    });
    channel.on(ChannelEvents.RTC_STATS, (channelId, stats) => {
      console.log(`rtcStats: ${channelId}`, stats);
    });
  };

  onPressCreateChannel = () => {
    const channelId = `channel_${Math.round(Math.random() * 100)}`;
    const { channels } = this.state;
    const rtcEngine = this.getRtcEngine();

    const channel = rtcEngine.createChannel(channelId)!;
    this.subscribeEvents(channel);
    this.setState({ channels: [...channels, channel] });

    channel.joinChannel(config.token, '', 0, {
      autoSubscribeAudio: false,
      autoSubscribeVideo: false,
      publishLocalAudio: false,
      publishLocalVideo: false,
    });
  };

  renderRightBar = () => {
    return (
      <div className={styles.rightBar}>
        <Button onClick={this.onPressCreateChannel}>Create Channel</Button>
      </div>
    );
  };
  renderItem = (channel: AgoraRtcChannel, index: number) => {
    return (
      <List.Item>
        <Card title={`order: ${index}`}>
          <p>{`ChannelId:\n${channel.channelId()}`}</p>
          <a onClick={() => channel.leaveChannel()}>Leave</a>
        </Card>
      </List.Item>
    );
  };

  render() {
    const { channels } = this.state;
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          <List
            style={{ width: '100%' }}
            grid={{ gutter: 16, column: 4 }}
            dataSource={channels}
            renderItem={this.renderItem}
          />
        </div>
        {this.renderRightBar()}
      </div>
    );
  }
}
