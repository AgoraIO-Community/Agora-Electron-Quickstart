import React, { Component } from 'react';

export default class Window extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { role, uid, channelId, rtcEngine } = this.props;

    const dom = document.querySelector(`#video-${uid}`);
    if (!dom || !rtcEngine) {
      return;
    }
    if (role === 'local') {
      rtcEngine.setupLocalView(0, 0, dom);
      rtcEngine.setupLocalViewContentMode(0, 0, 1);
    } else if (role === 'localVideoSource') {
      rtcEngine.setupLocalView(3, 0, dom);
      rtcEngine.setupLocalViewContentMode(3, 0, 1);
    } else if (role === 'remote') {
      rtcEngine.setupRemoteView(uid, channelId, dom);
      rtcEngine.setupRemoteViewContentMode(uid, 0, 1);
    }
  }

  render() {
    return (
      <div className="window-item">
        <div className="video-item" id={'video-' + this.props.uid}></div>
      </div>
    );
  }
}
