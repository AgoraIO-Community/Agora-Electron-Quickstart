import { Component } from 'react'
import creteAgoraRtcEngine, {
  AudioProfileType,
  AudioScenarioType,
  ChannelProfileType,
  DegradationPreference,
  IAudioDeviceManagerImpl,
  IRtcEngine,
  IRtcEngineEventHandlerEx,
  IRtcEngineEx,
  IVideoDeviceManagerImpl,
  OrientationMode,
  RtcConnection,
  RtcEngineExImplInternal,
  RtcStats,
  UserOfflineReasonType,
  VideoCodecType,
  VideoMirrorModeType,
  VideoSourceType,
} from 'agora-electron-sdk'
import { List, Card, Button } from 'antd'
import config from '../../config/agora.config'

import styles from '../../config/public.scss'
import { getRandomInt } from '../../util'

interface User {
  isMyself: boolean
  uid: number
  channelId?: string
}

interface State {
  connections: RtcConnection[]
  allUser: User[]
}

export default class JoinMultipleChannel
  extends Component<{}, State, any>
  implements IRtcEngineEventHandlerEx
{
  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  state: State = {
    connections: [],
    allUser: [],
  }

  componentWillUnmount() {
    this.rtcEngine?.release()
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = creteAgoraRtcEngine()
      //@ts-ignore
      window.rtcEngine = this.rtcEngine
      const res = this.rtcEngine.initialize({ appId: config.appID })
      console.log('initialize:', res)
    }

    return this.rtcEngine
  }

  onJoinChannelSuccessEx(
    { channelId, localUid }: RtcConnection,
    elapsed: number
  ): void {
    const { allUser: oldAllUser } = this.state
    const newAllUser = [...oldAllUser]
    newAllUser.push({ isMyself: true, uid: localUid, channelId })
    this.setState({
      allUser: newAllUser,
    })
  }

  onUserJoinedEx(
    connection: RtcConnection,
    remoteUid: number,
    elapsed: number
  ): void {
    console.log(
      'onUserJoinedEx',
      'connection',
      connection,
      'remoteUid',
      remoteUid
    )

    const { allUser: oldAllUser } = this.state
    const newAllUser = [...oldAllUser]
    newAllUser.push({ isMyself: false, uid: remoteUid })
    this.setState({
      allUser: newAllUser,
    })
  }

  onUserOffline(uid: number, reason: UserOfflineReasonType): void {
    console.log(`userOffline ---- ${uid}`)

    const { allUser: oldAllUser } = this.state
    const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== uid)]
    this.setState({
      allUser: newAllUser,
    })
  }

  onLeaveChannelEx(connection: RtcConnection, stats: RtcStats): void {
    this.setState({
      isJoined: false,
      allUser: [],
    })
  }

  onError(err: number, msg: string): void {
    console.error(err, msg)
  }

  onPressJoinChannel = (channelId: string) => {
    this.rtcEngine?.setChannelProfile(
      ChannelProfileType.ChannelProfileLiveBroadcasting
    )
    this.rtcEngine?.setAudioProfile(
      AudioProfileType.AudioProfileDefault,
      AudioScenarioType.AudioScenarioChatroom
    )

    const localUid = getRandomInt(1, 9999999)
    console.log(`localUid: ${localUid}`)
    this.rtcEngine?.joinChannel('', channelId, '', localUid)
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
