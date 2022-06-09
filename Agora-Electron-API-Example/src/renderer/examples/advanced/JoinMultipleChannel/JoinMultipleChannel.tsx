import creteAgoraRtcEngine, {
  AudioProfileType,
  AudioScenarioType,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  IRtcEngineEventHandlerEx,
  IRtcEngineEx,
  RtcConnection,
  RtcEngineExImplInternal,
  RtcStats,
  UserOfflineReasonType,
  VideoSourceType,
} from 'agora-electron-sdk'
import { Button, Card, Input, List } from 'antd'
import { Component } from 'react'
import Window from '../../component/Window'
import config from '../../config/agora.config'
import styles from '../../config/public.scss'

const { Search } = Input

const channelUid1 = 1001
const channelUid2 = 1002

interface User {
  isMyself: boolean
  uid: number
  channelId?: string
}

interface State {
  allUser1: User[]
  allUser2: User[]
  channel1: string
  channel2: string
  isJoined1: boolean
  isJoined2: boolean
}

export default class JoinMultipleChannel
  extends Component<{}, State, any>
  implements IRtcEngineEventHandlerEx
{
  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  state: State = {
    allUser1: [],
    allUser2: [],
    channel1: '',
    channel2: '',
    isJoined1: false,
    isJoined2: false,
  }

  componentDidMount() {
    this.getRtcEngine().registerEventHandler(this)
  }

  componentWillUnmount() {
    this.rtcEngine?.unregisterEventHandler(this)
    this.onPressLeaveAll()
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
    console.log('onJoinChannelSuccessEx', channelId, localUid)
    if (localUid === channelUid1) {
      this.setState({ isJoined1: true })
    } else if (localUid === channelUid2) {
      this.setState({ isJoined2: true })
    }
  }

  onUserJoinedEx(
    { localUid, channelId }: RtcConnection,
    remoteUid: number,
    elapsed: number
  ): void {
    console.log(
      'onUserJoinedEx',
      'channelId',
      channelId,
      'remoteUid',
      remoteUid
    )

    if (localUid === channelUid1) {
      const { allUser1: oldAllUser } = this.state
      const newAllUser = [...oldAllUser]
      newAllUser.push({
        isMyself: false,
        uid: remoteUid,
        channelId,
      })
      this.setState({
        allUser1: newAllUser,
      })
    } else if (localUid === channelUid2) {
      const { allUser2: oldAllUser } = this.state
      const newAllUser = [...oldAllUser]
      newAllUser.push({
        isMyself: false,
        uid: remoteUid,
        channelId,
      })
      this.setState({
        allUser2: newAllUser,
      })
    }
  }

  onUserOfflineEx(
    { localUid, channelId }: RtcConnection,
    remoteUid: number,
    reason: UserOfflineReasonType
  ): void {
    console.log('onUserOfflineEx', channelId, localUid, remoteUid)
    const { channel1, channel2 } = this.state
    if (channelId === channel1) {
      const { allUser1: oldAllUser } = this.state
      const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== remoteUid)]
      this.setState({
        allUser1: newAllUser,
      })
    } else if (channelId === channel2) {
      const { allUser2: oldAllUser } = this.state
      const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== remoteUid)]
      this.setState({
        allUser2: newAllUser,
      })
    }
  }

  onLeaveChannelEx(
    { channelId, localUid }: RtcConnection,
    stats: RtcStats
  ): void {
    console.log('onLeaveChannelEx', channelId, localUid)
    const { channel1, channel2 } = this.state
    if (channelId === channel1) {
      this.setState({ isJoined1: false, allUser1: [] })
    } else if (channelId === channel2) {
      this.setState({ isJoined2: false, allUser2: [] })
    }
  }

  onError(err: number, msg: string): void {
    console.error(err, msg)
  }

  onPressJoinChannel1 = (channelId) => {
    console.log('onPressJoinChannel1', channelId)
    this.setState({ channel1: channelId })
    this.getRtcEngine().setChannelProfile(
      ChannelProfileType.ChannelProfileLiveBroadcasting
    )
    this.rtcEngine?.setAudioProfile(
      AudioProfileType.AudioProfileDefault,
      AudioScenarioType.AudioScenarioChatroom
    )
    this.rtcEngine?.setClientRole(ClientRoleType.ClientRoleBroadcaster)

    const res = this.rtcEngine?.joinChannelEx(
      '',
      { localUid: channelUid1, channelId },
      {
        autoSubscribeAudio: false,
        autoSubscribeVideo: true,
        publishAudioTrack: false,
        publishCameraTrack: true,
        publishScreenTrack: false,
        enableAudioRecordingOrPlayout: false,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      }
    )
    console.log('onPressJoinChannel1', res)
  }

  onPressJoinChannel2 = (channelId) => {
    console.log('onPressJoinChannel2', channelId)
    this.setState({ channel2: channelId })
    this.getRtcEngine().setChannelProfile(
      ChannelProfileType.ChannelProfileLiveBroadcasting
    )
    this.rtcEngine?.setAudioProfile(
      AudioProfileType.AudioProfileDefault,
      AudioScenarioType.AudioScenarioChatroom
    )
    this.rtcEngine?.setClientRole(ClientRoleType.ClientRoleBroadcaster)

    const res = this.rtcEngine?.joinChannelEx(
      '',
      { localUid: channelUid2, channelId },
      {
        autoSubscribeAudio: false,
        autoSubscribeVideo: true,
        publishAudioTrack: false,
        publishCameraTrack: true,
        publishScreenTrack: false,
        enableAudioRecordingOrPlayout: false,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      }
    )
    console.log('onPressJoinChannel2', res)
  }

  onPressLeaveAll = () => {
    const { channel1, channel2 } = this.state
    this.rtcEngine.leaveChannelEx({
      localUid: channelUid1,
      channelId: channel1,
    })
    this.rtcEngine.leaveChannelEx({
      localUid: channelUid2,
      channelId: channel2,
    })
  }

  renderRightBar = () => {
    const { isJoined1, isJoined2 } = this.state
    return (
      <div className={styles.rightBar} style={{ justifyContent: 'flex-start' }}>
        <Search
          placeholder={'please input new channelId1'}
          defaultValue='Channel1'
          allowClear
          enterButton={'Join Channel 1'}
          size='small'
          disabled={isJoined1}
          onSearch={this.onPressJoinChannel1}
        />
        <br />
        <Search
          placeholder={'please input new channelId2'}
          defaultValue='Channel2'
          allowClear
          enterButton={'Join Channel 2'}
          size='small'
          disabled={isJoined2}
          onSearch={this.onPressJoinChannel2}
        />
        <br />
        <Button
          disabled={!isJoined1 && !isJoined2}
          onClick={this.onPressLeaveAll}
        >
          Leave All
        </Button>
      </div>
    )
  }

  renderItem = ({ isMyself, uid, channelId }: User) => {
    return (
      <List.Item>
        <Card title={`${isMyself ? 'Local' : 'Remote'} Uid: ${uid}`}>
          <Window
            uid={uid}
            rtcEngine={this.rtcEngine!}
            videoSourceType={VideoSourceType.VideoSourceRemote}
            channelId={channelId}
          />
        </Card>
      </List.Item>
    )
  }

  render() {
    const { allUser1, allUser2 } = this.state
    const hasUser = allUser1.length > 0 || allUser2.length > 0
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {hasUser && (
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
              dataSource={[...allUser1, ...allUser2]}
              renderItem={this.renderItem}
            />
          )}
        </div>
        {this.renderRightBar()}
      </div>
    )
  }
}
