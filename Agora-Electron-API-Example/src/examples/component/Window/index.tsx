import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import styles from './index.scss';

interface WindowProps {
  rtcEngine: AgoraRtcEngine;
  uid?: string | number;
  role: 'localVideoSource' | 'local' | 'remote';
  channelId?: string;
}
class Window extends Component<WindowProps> {
  componentDidMount() {
    const { uid, role, rtcEngine, channelId } = this.props;

    const dom = document.querySelector(`#video-${uid}`);
    console.log('Window', uid, role, channelId);
    // CROPPED = 0, FIT = 1
    if (role === 'local') {
      rtcEngine.setupLocalVideo(dom!);
      rtcEngine.setupViewContentMode('local', 1, undefined);
    } else if (role === 'localVideoSource') {
      rtcEngine.setupLocalVideoSource(dom!);
      rtcEngine.setupViewContentMode('videosource', 1, undefined);
    } else if (role === 'remote') {
      rtcEngine.subscribe(uid as number, dom!);
      rtcEngine.setupViewContentMode(uid as number, 1, undefined);
    }
  }

  render() {
    return (
      <div className={styles['window-item']}>
        <div className={styles['video-item']} id={'video-' + this.props.uid} />
      </div>
    );
  }
}

export default Window;
