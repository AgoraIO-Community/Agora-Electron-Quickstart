import React, { Component } from 'react';
import AgoraRtcEngine, { VideoSourceType } from 'agora-electron-sdk';
import styles from './index.scss';

interface WindowProps {
  rtcEngine: AgoraRtcEngine;
  uid?: number;
  videoSourceType: VideoSourceType;
  channelId?: string;
}
class Window extends Component<WindowProps> {
  componentDidMount() {
    const { uid, rtcEngine, channelId, videoSourceType } = this.props;

    const dom = document.querySelector(`#video-${uid}`)!;
    console.log(
      `Window:  VideoSourceType: ${videoSourceType}, channelId:${channelId}, uid:${uid}, view: ${dom}`
    );

    rtcEngine.setView({
      videoSourceType,
      uid,
      channelId,
      view: dom,
      rendererOptions: { mirror: false, contentMode: 1 },
    });
  }

  render() {
    const { uid } = this.props;
    return (
      <div className={styles['window-item']}>
        <div className={styles['video-item']} id={`video-${uid}`} />
      </div>
    );
  }
}

export default Window;
