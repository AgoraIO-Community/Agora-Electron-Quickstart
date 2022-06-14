import creteAgoraRtcEngine, {
  IMediaPlayer,
  IMediaPlayerSourceObserver,
  IRtcEngine,
  IRtcEngineEx,
  MediaPlayerError,
  MediaPlayerState,
  RtcEngineExImplInternal,
  VideoSourceType,
} from 'electron-agora-rtc-ng'
import { Button, Input } from 'antd'
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
      this.rtcEngine.setLogFile(config.nativeSDKLogPath)
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
          placeholder={'please input url for media'}
          defaultValue='https://agora-adc-artifacts.oss-cn-beijing.aliyuncs.com/video/meta_live_mpk.mov'
          allowClear
          enterButton={!isPlaying ? 'Play' : 'Stop'}
          size='small'
          onSearch={this.onPressMpk}
        />
        <br />
        {isPlaying && (
          <>
            <Button
              onClick={() => {
                this.getMediaPlayer().pause()
              }}
            >
              Pause
            </Button>
            <Button
              onClick={() => {
                this.getMediaPlayer().resume()
              }}
            >
              Resume
            </Button>
          </>
        )}
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
