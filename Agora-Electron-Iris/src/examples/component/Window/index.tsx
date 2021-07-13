import React, { Component } from 'react';
import AgoraRtcEngine, { CONTENT_MODE } from 'agora-electron-sdk';
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

    if (role === 'local') {
      rtcEngine.setView({
        user: 'local',
        view: dom!,
        rendererOptions: {
          append: false, // Whether to display in multiple views
          contentMode: CONTENT_MODE.FIT, // CROPPED = 0, FIT = 1
          mirror: true,
        },
      });
    } else if (role === 'localVideoSource') {
      rtcEngine.setView({
        user: 'videoSource',
        view: dom!,
        rendererOptions: {
          append: false, // Whether to display in multiple views
          contentMode: CONTENT_MODE.FIT, // CROPPED = 0, FIT = 1
          mirror: false,
        },
      });
    } else if (role === 'remote') {
      rtcEngine.setView({
        user: uid!,//用户 uid
        view: dom!,//web 的 dom 元素
        channelId,//频道号
        rendererOptions: {
          append: false, // Whether to display in multiple views
          contentMode: CONTENT_MODE.FIT, // CROPPED = 0, FIT = 1
          mirror: true,
        },
      });
    } else if (role === 'remoteVideoSource') {
      // dom && rtcEngine.subscribe(uid, dom);
      // rtcEngine.setupViewContentMode('videosource', 1);
      // rtcEngine.setupViewContentMode(String(SHARE_ID), 1);
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
