import React, { Component } from 'react';
import AgoraRtcEngine, {
  LOG_LEVEL,
  AREA_CODE,
  CLIENT_ROLE_TYPE,
  EngineEvents,
  CHANNEL_PROFILE_TYPE,
  AUDIO_PROFILE_TYPE,
  AUDIO_SCENARIO_TYPE,
  RENDER_MODE,
  VideoSourceType,
} from 'agora-electron-sdk';
import { List, Card, Input } from 'antd';
import config from '../../config/agora.config';
import styles from '../../config/public.scss';
import JoinChannelBar from '../../component/JoinChannelBar';
import Window from '../../component/Window';
import { randomInt } from 'crypto';
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
    this.getRtcEngine().enableVideo();// enableVideo();
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
      const res = this.rtcEngine?.initialize( {
        appId : config.appID,
        areaCode: AREA_CODE.AREA_CODE_GLOB,
        logConfig : {
          level: LOG_LEVEL.LOG_LEVEL_INFO,
          filePath: config.nativeSDKLogPath,
          fileSize: 2000
        }
      });
      console.log('initialize:', res);
      this.rtcEngine.setAddonLogFile(config.addonLogPath);
    }

    return this.rtcEngine;
  }

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
   
    rtcEngine.on(EngineEvents.JOINED_CHANNEL, ( connection, elapsed) => {
      console.log(
        `onJoinChannel channel: ${connection.channelId}  uid: ${connection.localUid}  version: ${JSON.stringify(
          rtcEngine.getVersion()
        )})`
      );
      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser];
      newAllUser.push({ isMyself: true, uid:connection.localUid });
      this.setState({
        isJoined: true,
        allUser: newAllUser,
      });
    });

    rtcEngine.on(EngineEvents.USER_JOINED, (connection, remoteUid, elapsed) => {
      console.log(`userJoined ---- ${remoteUid}`);

      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser];
      newAllUser.push({ isMyself: false, uid:remoteUid });
      this.setState({
        allUser: newAllUser,
      });
    });
    rtcEngine.on(EngineEvents.USER_OFFLINE, (connection, remoteUid, reason) => {
      console.log(`userOffline ---- ${remoteUid}`);

      const { allUser: oldAllUser } = this.state;
      const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== remoteUid)];
      this.setState({
        allUser: newAllUser,
      });
    });

    rtcEngine.on(EngineEvents.LEAVE_CHANNEL, (connection, rtcStats) => {
      console.log('leavechannel', connection.channelId, connection.localUid, rtcStats);

      this.setState({
        isJoined: false,
        allUser: [],
      });
    });
    rtcEngine.on(EngineEvents.LASTMILE_PROBE_RESULT, (result) => {
      console.log(`lastmileproberesult: ${JSON.stringify(result)}`);
    });
    rtcEngine.on(EngineEvents.LASTMILE_QUALITY, (quality) => {
      console.log(`lastmilequality: ${JSON.stringify(quality)}`);
    });

    rtcEngine.on(EngineEvents.CHANNEL_MEDIA_RELAY_STATE, (state, code) => {
      console.log('channelMediaRelayState: state', state, 'code', code);
    });
    rtcEngine.on(EngineEvents.CHANNEL_MEDIA_RELAY_EVENT, (event) => {
      console.log('channelMediaRelayEvent: event', event);
    });
    rtcEngine.on(EngineEvents.ERROR, (err) => {
      console.error(err);
    });
  };

  onPressJoinChannel = (channelId: string) =>  {
    this.setState({ channelId });
    this.rtcEngine?.setChannelProfile(
      CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_LIVE_BROADCASTING
    );
    this.rtcEngine?.setClientRole(CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER);
    this.rtcEngine?.setAudioProfile(
      AUDIO_PROFILE_TYPE.AUDIO_PROFILE_DEFAULT,
      AUDIO_SCENARIO_TYPE.AUDIO_SCENARIO_CHATROOM_ENTERTAINMENT
    );

    this.rtcEngine?.enableDualStreamMode(true);
    this.rtcEngine?.enableAudioVolumeIndication(1000, 3, false);

    this.rtcEngine?.setRenderMode(RENDER_MODE.SOFTWARE);
    this.rtcEngine?.enableVideo();
    this.rtcEngine?.enableLocalVideo(true);
    
    this.rtcEngine?.joinChannel(
      config.token,
        channelId,
        '',
        123,
      {
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
        publishAudioTrack: true,
        publishCameraTrack: true,
        publishScreenTrack: false,
        clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
        channelProfile: CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_LIVE_BROADCASTING,
        encodedVideoTrackOption: { targetBitrate: 600 },
      }
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
               
                console.log('relayChannnelName', relayChannnelName);
                this.getRtcEngine().startChannelMediaRelay({
                  srcInfo: { channelName: channelId, token: config.token, uid: 123 },
                  destInfos :[{channelName: relayChannnelName, token: config.token, uid: 123}],
                  destCount:1,
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
            videoSourceType = {VideoSourceType.kVideoSourceTypeCameraPrimary}
            //role={isMyself ? 'local' : 'remote'}
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
