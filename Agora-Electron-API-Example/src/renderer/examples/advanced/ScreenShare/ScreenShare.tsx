import creteAgoraRtcEngine, {
  IRtcEngine,
  IRtcEngineEventHandlerEx,
  IRtcEngineEx,
  RtcConnection,
  RtcEngineExImplInternal,
  RtcStats,
  UserOfflineReasonType,
  VideoSourceType,
} from 'agora-electron-sdk'
import { Card, message } from 'antd'
import { Component } from 'react'
import DropDownButton from '../../component/DropDownButton'
import JoinChannelBar from '../../component/JoinChannelBar'
import Window from '../../component/Window'
import config from '../../config/agora.config'
import styles from '../../config/public.scss'
import { getRandomInt } from '../../util'
import { rgbImageBufferToBase64 } from '../../util/base64'
import screenStyle from './ScreenShare.scss'

const locaScreenlUid1 = getRandomInt(1, 9999999)
const locaScreenlUid2 = getRandomInt(1, 9999999)

interface State {
  // currentFps?: number
  // currentResolution?: { width: number; height: number }
  captureInfoList: any[]
  currentWindowSourceId?: number
  currentScreenSourceId?: number
  channelId: string
  isShared: boolean
}

const SCREEN_SHARE_ID = 99

export default class ScreenShare
  extends Component<{}, State, any>
  implements IRtcEngineEventHandlerEx
{
  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  state: State = {
    captureInfoList: [],
    channelId: '',
    isShared: false,
  }

  componentDidMount = async () => {
    this.getScreenCaptureInfo()

    this.getRtcEngine().registerEventHandler(this)
  }

  componentWillUnmount() {
    this.rtcEngine?.unregisterEventHandler(this)
    this.onPressStopSharing()
    this.getRtcEngine().release()
  }

  getScreenCaptureInfo = async () => {
    const list = this.getRtcEngine().getScreenCaptureSources(
      { width: 500, height: 500 },
      { width: 500, height: 500 },
      true
    )

    const imageList = list.map((item) =>
      rgbImageBufferToBase64(item.thumbImage)
    )

    const formatList = list.map(
      ({ sourceName, sourceTitle, sourceId, type }, index) => ({
        isScreen: type === 1,
        image: imageList[index],
        sourceId,
        sourceName,
        sourceTitle:
          sourceTitle.length < 20
            ? sourceTitle
            : sourceTitle.replace(/\s+/g, '').substr(0, 20) + '...',
      })
    )
    this.setState({ captureInfoList: formatList })
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
    // this.setState({
    //   localVideoSourceUid: connection.localUid,
    // })
    // const { allUser: oldAllUser } = this.state
    // const newAllUser = [...oldAllUser]
    // newAllUser.push({ isMyself: true, uid: localUid })
    // this.setState({
    //   isJoined: true,
    //   allUser: newAllUser,
    // })
  }

  onUserJoinedEx(
    connection: RtcConnection,
    remoteUid: number,
    elapsed: number
  ): void {
    // console.log(
    //   'onUserJoinedEx',
    //   'connection',
    //   connection,
    //   'remoteUid',
    //   remoteUid
    // )
    // const { allUser: oldAllUser } = this.state
    // const newAllUser = [...oldAllUser]
    // newAllUser.push({ isMyself: false, uid: remoteUid })
    // this.setState({
    //   allUser: newAllUser,
    // })
  }

  onUserOfflineEx(
    { localUid, channelId }: RtcConnection,
    remoteUid: number,
    reason: UserOfflineReasonType
  ): void {
    // console.log('onUserOfflineEx', channelId, remoteUid)
    // const { allUser: oldAllUser } = this.state
    // const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== remoteUid)]
    // this.setState({
    //   allUser: newAllUser,
    // })
  }

  onLeaveChannelEx(connection: RtcConnection, stats: RtcStats): void {
    // this.setState({
    //   isJoined: false,
    //   allUser: [],
    // })
  }

  onError(err: number, msg: string): void {
    console.error(err, msg)
  }

  startWindowCapture = (channelId: string) => {
    const { currentWindowSourceId } = this.state

    const rtcEngine = this.getRtcEngine()
    rtcEngine.startPrimaryScreenCapture({
      isCaptureWindow: true,
      screenRect: { width: 0, height: 0, x: 0, y: 0 },
      windowId: currentWindowSourceId,
      params: {
        dimensions: { width: 1920, height: 1080 },
        bitrate: 1000,
        frameRate: 15,
        captureMouseCursor: false,
        windowFocus: false,
        excludeWindowList: [],
        excludeWindowCount: 0,
      },

      regionRect: { x: 0, y: 0, width: 0, height: 0 },
    })
    rtcEngine.joinChannelEx(
      '',
      {
        localUid: locaScreenlUid1,
        channelId,
      },
      {
        publishCameraTrack: false,
        publishAudioTrack: false,
        publishScreenTrack: true,
        publishCustomAudioTrack: false,
        publishCustomVideoTrack: false,
        publishEncodedVideoTrack: false,
        publishMediaPlayerAudioTrack: false,
        publishMediaPlayerVideoTrack: false,
        autoSubscribeAudio: false,
        autoSubscribeVideo: false,
        clientRoleType: 1,
      }
    )
  }

  startScreenCapture = (channelId: string) => {
    const { currentScreenSourceId } = this.state

    const rtcEngine = this.getRtcEngine()
    rtcEngine.startSecondaryScreenCapture({
      isCaptureWindow: false,
      screenRect: { width: 0, height: 0, x: 0, y: 0 },
      windowId: currentScreenSourceId,
      params: {
        dimensions: { width: 1920, height: 1080 },
        bitrate: 1000,
        frameRate: 15,
        captureMouseCursor: false,
        windowFocus: false,
        excludeWindowList: [],
        excludeWindowCount: 0,
      },

      regionRect: { x: 0, y: 0, width: 0, height: 0 },
    })

    rtcEngine.joinChannelEx(
      '',
      {
        localUid: locaScreenlUid2,
        channelId,
      },
      {
        publishCameraTrack: false,
        publishAudioTrack: false,
        publishScreenTrack: false,
        publishSecondaryScreenTrack: true,
        publishCustomAudioTrack: false,
        publishCustomVideoTrack: false,
        publishEncodedVideoTrack: false,
        publishMediaPlayerAudioTrack: false,
        publishMediaPlayerVideoTrack: false,
        autoSubscribeAudio: false,
        autoSubscribeVideo: false,
        clientRoleType: 1,
      }
    )
  }

  onPressStartShare = async (channelId: string) => {
    const { currentScreenSourceId, currentWindowSourceId } = this.state
    if (
      currentScreenSourceId === undefined ||
      currentWindowSourceId === undefined
    ) {
      message.error(
        `Must select window:${currentWindowSourceId} and screen:${currentScreenSourceId} to share`
      )
      return true
    }
    this.setState({ channelId, isShared: true })
    await this.startWindowCapture(channelId)
    await this.startScreenCapture(channelId)

    return false
  }

  onPressStopSharing = () => {
    this.setState({ isShared: false })
    const rtcEngine = this.getRtcEngine()
    rtcEngine.stopPrimaryScreenCapture()
    rtcEngine.stopSecondaryScreenCapture()
    const { channelId } = this.state
    rtcEngine.leaveChannelEx({ channelId, localUid: locaScreenlUid1 })
    rtcEngine.leaveChannelEx({ channelId, localUid: locaScreenlUid2 })
  }

  renderPopup = (item: { image: string }) => {
    return (
      <div>
        <img
          src={item.image}
          alt='preview img'
          className={screenStyle.previewShotBig}
        />
      </div>
    )
  }

  renderRightBar = () => {
    const { captureInfoList } = this.state

    const screenList = captureInfoList
      .filter((obj) => obj.isScreen)
      .map((obj) => ({
        dropId: obj,
        dropText: obj.sourceName,
      }))
    const windowList = captureInfoList
      .filter((obj) => !obj.isScreen)
      .map((obj) => ({
        dropId: obj,
        dropText: obj.sourceTitle,
      }))


    return (
      <div className={styles.rightBar}>
        <div>
          <div>Please Select a window/scrren to share</div>
          <DropDownButton
            defaultIndex={0}
            title='Screen Share'
            options={screenList}
            PopContent={this.renderPopup}
            PopContentTitle='Preview'
            onPress={(res) => {
              console.log('Screen Share choose', res.dropId.sourceId)
              const sourceId = res.dropId.sourceId
              if (sourceId === undefined) {
                return
              }
              this.setState({ currentScreenSourceId: sourceId })
            }}
          />
          <DropDownButton
            defaultIndex={0}
            title='Windows Share'
            options={windowList}
            PopContent={this.renderPopup}
            PopContentTitle='Preview'
            onPress={(res) => {
              console.log('Windows Share choose', res.dropId.sourceId)
              const sourceId = res.dropId.sourceId
              if (sourceId === undefined) {
                return
              }
              this.setState({ currentWindowSourceId: sourceId })
            }}
          />
        </div>
        <JoinChannelBar
          buttonTitle='Start Share'
          buttonTitleDisable='Stop Share'
          onPressJoin={this.onPressStartShare}
          onPressLeave={this.onPressStopSharing}
        />
      </div>
    )
  }

  render() {
    const { isShared, channelId } = this.state
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {isShared && (
            <>
              <Card title='Local Share1' className={styles.card}>
                <Window
                  uid={locaScreenlUid1}
                  rtcEngine={this.rtcEngine!}
                  videoSourceType={VideoSourceType.VideoSourceScreenPrimary}
                  channelId={channelId}
                />
              </Card>
              <Card title='Local Share2' className={styles.card}>
                <Window
                  uid={locaScreenlUid2}
                  rtcEngine={this.rtcEngine!}
                  videoSourceType={VideoSourceType.VideoSourceScreenSecondary}
                  channelId={channelId}
                />
              </Card>
            </>
          )}
        </div>
        {this.renderRightBar()}
      </div>
    )
  }
}
