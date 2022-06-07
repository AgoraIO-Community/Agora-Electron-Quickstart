import creteAgoraRtcEngine, {
  IMediaPlayer,
  IRtcEngine,
  IRtcEngineEventHandlerEx,
  IRtcEngineEx,
  MediaPlayerError,
  MediaPlayerState,
  RtcConnection,
  RtcEngineExImplInternal,
  RtcStats,
  UserOfflineReasonType,
  VideoSourceType,
} from 'agora-electron-sdk'
import { IMediaPlayerSourceObserver } from 'agora-electron-sdk/types/Private/IAgoraMediaPlayerSource'
import { Input } from 'antd'
import { Component } from 'react'
import Window from '../../component/Window'
import config from '../../config/agora.config'
import styles from '../../config/public.scss'
const { Search } = Input

interface State {
  isPlaying: boolean
  mpkState?: MediaPlayerState
}

export default class MediaPlayer
  extends Component<State>
  implements IMediaPlayerSourceObserver
{
  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  mpk?: IMediaPlayer

  streamId?: number

  state: State = {
    isPlaying: false,
    mpkState: undefined,
  }

  componentDidMount() {
    this.getMediaPlayer().registerPlayerSourceObserver(this)
  }

  componentWillUnmount() {
    this.getMediaPlayer().unregisterPlayerSourceObserver(this)
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

  getMediaPlayer = () => {
    if (!this.mpk) {
      const mpk = this.getRtcEngine().createMediaPlayer()
      this.mpk = mpk
      return mpk
    }
    return this.mpk
  }

  onPlayerSourceStateChanged(
    state: MediaPlayerState,
    ec: MediaPlayerError
  ): void {
    switch (state) {
      case MediaPlayerState.PlayerStateOpenCompleted:
        console.log('onPlayerSourceStateChanged1:open finish')
        this.getMediaPlayer().play()
        break
      default:
        break
    }
    console.log('onPlayerSourceStateChanged', state, ec)
    this.setState({ mpkState: state })
  }

  // onJoinChannelSuccessEx(
  //   { channelId, localUid }: RtcConnection,
  //   elapsed: number
  // ): void {
  //   try {
  //     const { allUser: oldAllUser } = this.state
  //     const newAllUser = [...oldAllUser]
  //     newAllUser.push({ isMyself: true, uid: localUid })
  //     this.setState({
  //       isJoined: true,
  //       allUser: newAllUser,
  //     })
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // onUserJoinedEx(
  //   connection: RtcConnection,
  //   remoteUid: number,
  //   elapsed: number
  // ): void {
  //   console.log(
  //     'onUserJoinedEx',
  //     'connection',
  //     connection,
  //     'remoteUid',
  //     remoteUid
  //   )

  //   const { allUser: oldAllUser } = this.state
  //   const newAllUser = [...oldAllUser]
  //   newAllUser.push({ isMyself: false, uid: remoteUid })
  //   this.setState({
  //     allUser: newAllUser,
  //   })
  // }

  // onUserOfflineEx(
  //   { localUid, channelId }: RtcConnection,
  //   remoteUid: number,
  //   reason: UserOfflineReasonType
  // ): void {
  //   console.log('onUserOfflineEx', channelId, remoteUid)

  //   const { allUser: oldAllUser } = this.state
  //   const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== remoteUid)]
  //   this.setState({
  //     allUser: newAllUser,
  //   })
  // }

  // onLeaveChannelEx(connection: RtcConnection, stats: RtcStats): void {
  //   this.setState({
  //     isJoined: false,
  //     allUser: [],
  //   })
  // }

  // onError(err: number, msg: string): void {
  //   console.error(err, msg)
  // }

  onPressMpk = (url) => {
    if (!url) {
      return
    }
    const { isPlaying } = this.state
    const mpk = this.getMediaPlayer()
    if (isPlaying) {
      mpk.stop()
    } else {
      mpk.open(url, 0)
    }

    this.setState({ isPlaying: !isPlaying })
  }

  renderRightBar = () => {
    const { isPlaying } = this.state
    return (
      <div className={styles.rightBar} style={{ justifyContent: 'flex-start' }}>
        <Search
          defaultValue={'please input url for media'}
          value='https://agora-adc-artifacts.oss-cn-beijing.aliyuncs.com/video/meta_live_mpk.mov'
          allowClear
          enterButton={!isPlaying ? 'Play' : 'Stop'}
          size='small'
          onSearch={this.onPressMpk}
        />
        <br />
      </div>
    )
  }

  render() {
    const { isPlaying } = this.state
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {isPlaying && (
            <Window
              uid={this.getMediaPlayer().getMediaPlayerId()}
              rtcEngine={this.rtcEngine!}
              videoSourceType={VideoSourceType.VideoSourceMediaPlayer}
              channelId={''}
            />
          )}
        </div>
        {this.renderRightBar()}
      </div>
    )
  }
}
