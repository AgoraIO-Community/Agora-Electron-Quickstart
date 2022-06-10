import creteAgoraRtcEngine, {
  IRtcEngine,
  IRtcEngineEventHandlerEx,
  IRtcEngineEx,
  IVideoDeviceManagerImpl,
  RtcConnection,
  RtcEngineExImplInternal,
  RtcStats,
  UserOfflineReasonType,
  VideoSourceType,
} from 'agora-electron-sdk'
import { Card, Switch } from 'antd'
import { Component } from 'react'
import DropDownButton from '../../component/DropDownButton'
import JoinChannelBar from '../../component/JoinChannelBar'
import Window from '../../component/Window'
import config from '../../config/agora.config'
import styles from '../../config/public.scss'
import { getRandomInt } from '../../util'
import { rgbImageBufferToBase64 } from '../../util/base64'
import screenStyle from './CameraAndScreenShare.scss'

const localUid1 = getRandomInt(1, 9999999)
const localUid2 = getRandomInt(1, 9999999)

interface State {
  captureInfoList: any[]
  currentShare?: any
  channelId: string
  isStart: boolean
  cameraDevices: Device[]
  firstCameraId: string
  enableShare: boolean
  enableCamera: boolean
}
interface Device {
  deviceId: string
  deviceName: string
}

export default class CameraAndScreenShare
  extends Component<{}, State, any>
  implements IRtcEngineEventHandlerEx
{
  videoDeviceManager: IVideoDeviceManagerImpl

  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  state: State = {
    captureInfoList: [],
    channelId: '',
    isStart: false,
    cameraDevices: [],
    firstCameraId: '',
    enableShare: true,
    enableCamera: true,
  }

  componentDidMount = async () => {
    this.getScreenCaptureInfo()

    this.getRtcEngine().registerEventHandler(this)

    this.videoDeviceManager = new IVideoDeviceManagerImpl()

    this.setState({
      cameraDevices: this.videoDeviceManager.enumerateVideoDevices() as any,
    })
  }

  componentWillUnmount() {
    this.rtcEngine?.unregisterEventHandler(this)
    this.onPressStop()
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
      this.rtcEngine.setLogFile(config.nativeSDKLogPath)
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

  startCameraCapture = (channelId: string) => {
    const { firstCameraId, enableCamera } = this.state
    if (!enableCamera) {
      return
    }
    const rtcEngine = this.getRtcEngine()
    let res = rtcEngine.startPrimaryCameraCapture({ deviceId: firstCameraId })
    console.log('startPrimaryCameraCapture', res)

    res = rtcEngine.joinChannelEx(
      '',
      {
        localUid: localUid2,
        channelId,
      },
      {
        publishCameraTrack: true,
        publishAudioTrack: false,
        publishScreenTrack: false,
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
    console.log('joinChannelEx', res)
  }

  startScreenCapture = (channelId: string) => {
    const { currentShare, enableShare } = this.state
    if (!enableShare) {
      return
    }
    const { isScreen, sourceId } = currentShare
    console.log(currentShare)

    const rtcEngine = this.getRtcEngine()
    let res = rtcEngine.startPrimaryScreenCapture({
      isCaptureWindow: !isScreen,
      screenRect: { width: 0, height: 0, x: 0, y: 0 },
      windowId: sourceId,
      displayId: sourceId,
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
    console.log('startPrimaryScreenCapture', res)

    res = rtcEngine.joinChannelEx(
      '',
      {
        localUid: localUid1,
        channelId,
      },
      {
        publishCameraTrack: false,
        publishAudioTrack: false,
        publishScreenTrack: true,
        publishSecondaryScreenTrack: false,
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
    console.log('joinChannelEx', res)
  }

  onPressStart = async (channelId: string) => {
    this.setState({ channelId, isStart: true })
    await this.startScreenCapture(channelId)
    await this.startCameraCapture(channelId)

    return false
  }

  onPressStop = () => {
    this.setState({ isStart: false })
    const rtcEngine = this.getRtcEngine()
    rtcEngine.stopPrimaryScreenCapture()

    const { channelId } = this.state
    rtcEngine.leaveChannelEx({ channelId, localUid: localUid1 })
    rtcEngine.leaveChannelEx({ channelId, localUid: localUid2 })
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
    const { captureInfoList, cameraDevices, enableShare, enableCamera } =
      this.state
    return (
      <div className={styles.rightBar}>
        <div>
          <div>Please Select camera and screen </div>
          <div
            style={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            {'Enable Camera:   '}
            <Switch
              checkedChildren='Enable'
              unCheckedChildren='Disable'
              defaultChecked={enableCamera}
              onChange={(value) => {
                this.setState({ enableCamera: value })
              }}
            />
          </div>
          {enableCamera && (
            <DropDownButton
              options={cameraDevices.map((obj) => {
                const { deviceId, deviceName } = obj
                return { dropId: deviceId, dropText: deviceName, ...obj }
              })}
              onPress={(res) => {
                const deviceId = res.dropId
                this.setState({ firstCameraId: deviceId })
              }}
              title='Camera Device'
            />
          )}
          <br />
          <div
            style={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            {'Enable Share:   '}
            <Switch
              checkedChildren='Enable'
              unCheckedChildren='Disable'
              defaultChecked={enableShare}
              onChange={(value) => {
                this.setState({ enableShare: value })
              }}
            />
          </div>
          {enableShare && (
            <DropDownButton
              defaultIndex={0}
              title='Share Window/Screen'
              options={captureInfoList.map((obj) => ({
                dropId: obj,
                dropText: obj.sourceName || obj.sourceTitle,
              }))}
              PopContent={this.renderPopup}
              PopContentTitle='Preview'
              onPress={(res) => {
                const info = res.dropId
                if (info === undefined) {
                  return
                }
                this.setState({ currentShare: info })
              }}
            />
          )}
        </div>
        <JoinChannelBar
          buttonTitle='Start'
          buttonTitleDisable='Stop'
          onPressJoin={this.onPressStart}
          onPressLeave={this.onPressStop}
        />
      </div>
    )
  }

  render() {
    const { isStart, channelId, enableCamera, enableShare } = this.state
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {isStart && (
            <>
              {enableShare && (
                <Card title='Local Share' className={styles.card}>
                  <Window
                    uid={localUid1}
                    rtcEngine={this.rtcEngine!}
                    videoSourceType={VideoSourceType.VideoSourceScreenPrimary}
                    channelId={channelId}
                  />
                </Card>
              )}
              {enableCamera && (
                <Card title='Local Camera' className={styles.card}>
                  <Window
                    uid={localUid2}
                    rtcEngine={this.rtcEngine!}
                    videoSourceType={VideoSourceType.VideoSourceCamera}
                    channelId={channelId}
                  />
                </Card>
              )}
            </>
          )}
        </div>
        {this.renderRightBar()}
      </div>
    )
  }
}
