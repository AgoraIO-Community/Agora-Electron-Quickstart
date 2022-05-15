import { Component } from 'react'
import AgoraRtcEngine, {
  AREA_CODE,
  LOG_LEVEL,
  CLIENT_ROLE_TYPE,
  CHANNEL_PROFILE_TYPE,
  RtcConnection,
  EngineEvents,
} from 'agora-electron-sdk'
import { List, Card, Button } from 'antd'
import config from '../../config/agora.config'

import styles from '../../config/public.scss'

interface State {
  connections: RtcConnection[]
}

export default class JoinMultipleChannel extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine

  state: State = {
    connections: [],
  }

  componentWillUnmount() {
    this.rtcEngine?.release()
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      window.rtcEngine = this.rtcEngine
      const res = this.rtcEngine?.initialize({
        appId: config.appID,
        areaCode: AREA_CODE.AREA_CODE_GLOB,
        logConfig: {
          level: LOG_LEVEL.LOG_LEVEL_INFO,
          filePath: config.nativeSDKLogPath,
          fileSize: 2000,
        },
      })
      console.log('initialize', res)
      this.rtcEngine.setAddonLogFile(config.addonLogPath)
    }

    return this.rtcEngine
  }

  subscribeEvents = (rtcEngine: AgoraRtcEngine, connection: RtcConnection) => {
    const channelId = connection.channelId
    const { connections } = this.state
    rtcEngine.on(EngineEvents.JOIN_CHANNEL_SUCCESS, (connection, elapsed) => {
      this.setState({
        connections: [
          ...connections,
          {
            channelId,
            localUid: connection.localUid,
          },
        ],
      })
      console.log(
        `onJoinChannelSuccess channel: ${connection.channelId}  uid: ${
          connection.localUid
        }  version: ${JSON.stringify(rtcEngine.getVersion())})`
      )
    })

    rtcEngine.on(EngineEvents.LEAVE_CHANNEL, (connection, rtcStats) => {
      const { connections: oldAllConnection } = this.state
      const newAllConnections = [
        ...oldAllConnection.filter(
          (obj) => obj.localUid !== connection.localUid
        ),
      ]
      this.setState({
        connections: newAllConnections,
      })
      console.log(
        `leaveChannel: ${channelId} ${connection.localUid}`,
        channelId,
        connection.localUid,
        rtcStats
      )
    })
    rtcEngine.on(EngineEvents.ERROR, (err, msg) => {
      console.error(err)
    })
  }

  onPressCreateChannel = () => {
    const channelId = `channel_${Math.round(Math.random() * 100)}`
    const localUid = Math.round(Math.random() * 1000000)
    const rtcEngine = this.getRtcEngine()

    rtcEngine?.joinChannelEx(
      config.token,
      {
        channelId,
        localUid,
      },
      {
        autoSubscribeAudio: false,
        autoSubscribeVideo: false,
        publishAudioTrack: false,
        publishCameraTrack: false,
        publishScreenTrack: false,
        clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
        channelProfile: CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_LIVE_BROADCASTING,
        encodedVideoTrackOption: { targetBitrate: 600 },
      }
    )
    // const channel = rtcEngine.createChannel(channelId)!;
    this.subscribeEvents(rtcEngine, {
      channelId,
      localUid,
    })
  }

  renderRightBar = () => {
    return (
      <div className={styles.rightBar}>
        <Button onClick={this.onPressCreateChannel}>Create Channel</Button>
      </div>
    )
  }

  renderItem = (connection: RtcConnection, index: number) => (
    <List.Item>
      <Card title={`order: ${index}`}>
        <p>{`ChannelId:\n${connection.channelId}`}</p>
        <a onClick={() => this.getRtcEngine().leaveChannelEx(connection)}>
          Leave
        </a>
      </Card>
    </List.Item>
  )

  render() {
    const { connections } = this.state
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          <List
            style={{ width: '100%' }}
            grid={{ gutter: 16, column: 4 }}
            dataSource={connections}
            renderItem={this.renderItem}
          />
        </div>
        {this.renderRightBar()}
      </div>
    )
  }
}
