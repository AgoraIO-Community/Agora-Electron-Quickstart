import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List, Card, Button } from 'antd';
import config from '../../config/agora.config';

import styles from '../../config/public.scss';

interface State {
  channels: any[];
}

export default class JoinMultipleChannel extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine;

  state: State = {
    channels: [],
  };

  componentWillUnmount() {
    this.rtcEngine?.release();
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      window.rtcEngine = this.rtcEngine;
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

  subscribeEvents = (channel: any) => {
    const channelId = channel.rtcChannel.channelId();

    channel.on('joinChannelSuccess', (uid, elapsed) => {
      console.log(
        `joinChannelSuccess: ${channelId} uid:${uid},elapsed:${elapsed}`
      );
    });
    channel.on('leaveChannel', (stats) => {
      const { channels } = this.state;
      console.log(`leaveChannel: ${channelId}`, stats);
      this.setState({
        channels: channels.filter((c) => c.channelId() !== channelId),
      });
    });
    channel.on('channelError', (err, msg) => {
      console.log(`channelError: ${channelId}`, channelId, err, msg);
    });
    channel.on('channelWarning', (warn, msg) => {
      console.log(`channelError: ${channelId}`, channelId, warn, msg);
    });
    channel.on('userJoined', (uid, elapsed) => {
      console.log(`userJoined: ${channelId}`, uid, elapsed);
    });
    channel.on('rtcStats', (stats) => {
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
    // auto subscribe options after join channel
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

  renderItem = (channel: any, index: number) => (
    <List.Item>
      <Card title={`order: ${index}`}>
        <p>{`ChannelId:\n${channel.channelId()}`}</p>
        <a onClick={() => channel.leaveChannel()}>Leave</a>
      </Card>
    </List.Item>
  );

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
