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
    console.log('Window', role);
    // CROPPED = 0, FIT = 1
    if (role === 'local') {
      rtcEngine.setupLocalVideo(dom!);

      rtcEngine.setupViewContentMode('local', 1, channelId);
      console.log('local', uid, dom, channelId);
    } else if (role === 'localVideoSource') {
      rtcEngine.setupLocalVideoSource(dom!);
      rtcEngine.setupViewContentMode('videosource', 1, channelId);
    } else if (role === 'remote') {
      rtcEngine.subscribe(uid as number, dom!);
      rtcEngine.setupViewContentMode(uid as number, 1, undefined);
      console.log('remote', uid, dom, channelId);
    } else if (role === 'remoteVideoSource') {
      rtcEngine.subscribe(uid as number, dom!);
      rtcEngine.setupViewContentMode(uid, 1);
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
