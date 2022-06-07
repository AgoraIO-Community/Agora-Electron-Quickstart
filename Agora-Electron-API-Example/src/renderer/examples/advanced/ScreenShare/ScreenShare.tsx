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
import { Card, message } from 'antd'
import config from '../../config/agora.config'
import DropDownButton from '../../component/DropDownButton'
import styles from '../../config/public.scss'
import screenStyle from './ScreenShare.scss'
import JoinChannelBar from '../../component/JoinChannelBar'
import Window from '../../component/Window'
import { readImage } from '../../util/base64'
import { getRandomInt } from '../../util'

interface State {
  currentFps?: number
  currentResolution?: { width: number; height: number }
  screenInfoList: any[]
  windowInfoList: any[]
  localVideoSourceUid?: number
  selectedShareInfo?: { type: 'screen' | 'window'; info: any }
  shared: Boolean
}

const SCREEN_SHARE_ID = 99

export default class ScreenShare
  extends Component<{}, State, any>
  implements IRtcEngineEventHandlerEx
{
  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  state: State = {
    screenInfoList: [],
    windowInfoList: [],
    shared: false,
  }

  componentDidMount = async () => {
    this.getRtcEngine().registerEventHandler(this)
  }

  componentWillUnmount() {
    this.rtcEngine?.unregisterEventHandler(this)
    this.onPressStopSharing()
    this.getRtcEngine().release()
  }

  getScreenCaptureInfo = async () => {
    const list = this.getRtcEngine().getScreenCaptureSources(
      { width: 300, height: 300 },
      { width: 300, height: 300 },
      true
    )
    console.log('list', list)

    // const imageListPromise = list.map((item) => readImage(item.image))
    // const imageList = await Promise.all(imageListPromise)

    // const windowInfoList = list.map(({ ownerName, name, windowId }, index) => ({
    //   ownerName,
    //   image: imageList[index],
    //   windowId,
    //   name:
    //     name.length < 20
    //       ? name
    //       : name.replace(/\s+/g, '').substr(0, 20) + '...',
    // }))
    // this.setState({ windowInfoList })
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

  startScreenOrWindowCapture = (type: string, screenSymbol: any) => {
    // const rtcEngine = this.getRtcEngine()
    // console.log(`start sharing display ${JSON.stringify(screenSymbol)}`)
    // const excludeList = new Array<number>()
    // var res = -1
    // if (type === 'screen') {
    //   const res = rtcEngine.startScreenCaptureByScreen(
    //     screenSymbol,
    //     {
    //       x: screenSymbol.x,
    //       y: screenSymbol.y,
    //       width: screenSymbol.width,
    //       height: screenSymbol.height,
    //     },
    //     {
    //       dimensions: {
    //         width: screenSymbol.width,
    //         height: screenSymbol.height,
    //       },
    //       bitrate: 2000,
    //       frameRate: 5,
    //       captureMouseCursor: true,
    //       windowFocus: false,
    //       excludeWindowList: excludeList,
    //       excludeWindowCount: excludeList.length,
    //     }
    //   )
    //   console.log('startScreenCaptureByScreen:', res)
    // } else {
    //   const info = this.state.windowInfoList.find((obj) => {
    //     if (obj.windowId == screenSymbol) return obj
    //   })
    //   const res = rtcEngine.startScreenCaptureByWindow(
    //     screenSymbol,
    //     {
    //       x: info.x,
    //       y: info.y,
    //       width: info.originWidth,
    //       height: info.originHeight,
    //     },
    //     {
    //       dimensions: { width: info.originWidth, height: info.originHeight },
    //       bitrate: 2000,
    //       frameRate: 15,
    //       captureMouseCursor: true,
    //       windowFocus: false,
    //       excludeWindowList: excludeList,
    //       excludeWindowCount: excludeList.length,
    //     }
    //   )
    //   console.log('startScreenCaptureByWindow:', res)
    // }
    // if (res != 0) this.setState({ shared: false })
    // else this.setState({ shared: true })
  }

  onPressStartShare = async (channelId: string) => {
    // const { selectedShareInfo } = this.state
    // if (!selectedShareInfo) {
    //   message.error('Must select a window/screen to share')
    //   return true
    // }
    // const {
    //   info: { displayId, windowId },
    //   type,
    // } = selectedShareInfo
    // try {
    //   await this.startScreenOrWindowCapture(type, displayId || windowId)
    //   const res = await this.JoinChannel(channelId)
    //   return false
    // } catch (error) {
    //   console.error(error)
    // }
    // console.log('----4')
    // return true
  }

  onPressStopSharing = () => {
    // const shared = this.state
    // if (shared) {
    //   const rtcEngine = this.getRtcEngine()
    //   rtcEngine.stopScreenCapture()
    //   rtcEngine.leaveChannel()
    //   this.setState({ localVideoSourceUid: undefined, shared: false })
    // }
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
    const { windowInfoList, screenInfoList, selectedShareInfo } = this.state
    const {
      type,
      info: { image, name },
    } = selectedShareInfo || {
      type: undefined,
      info: { image: undefined, name: undefined },
    }

    return (
      <div className={styles.rightBar}>
        <div>
          <div>Please Select a window/scrren to share</div>
          <DropDownButton
            title='Screen Share'
            options={screenInfoList.map((obj) => ({
              dropId: obj,
              dropText: obj.name,
            }))}
            PopContent={this.renderPopup}
            PopContentTitle='Preview'
            onPress={(res) => {
              this.setState({
                selectedShareInfo: { type: 'screen', info: res.dropId },
              })
            }}
          />
          <DropDownButton
            title='Windows Share'
            options={windowInfoList.map((obj) => ({
              dropId: obj,
              dropText: obj.name,
            }))}
            PopContent={this.renderPopup}
            PopContentTitle='Preview'
            onPress={(res) => {
              this.setState({
                selectedShareInfo: { type: 'window', info: res.dropId },
              })
            }}
          />
          <div className={styles.selectedItem}>
            <span className={styles.require}>* </span>Current Selected
          </div>
          <div>
            <div>Type: {type}</div>
            <div>Name: {name}</div>
            <div>
              {image && (
                <img
                  src={image}
                  alt='img shot'
                  className={screenStyle.previewShot}
                />
              )}
            </div>
          </div>
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
    const { localVideoSourceUid } = this.state
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {localVideoSourceUid && (
            <Card title='Local Share' className={styles.card}>
              <Window
                uid={localVideoSourceUid}
                rtcEngine={this.rtcEngine!}
                videoSourceType={VideoSourceType.kVideoSourceTypeScreenPrimary}
                //role={isMyself ? 'local' : 'remote'}
                channelId={config.defaultChannelId}
              />
            </Card>
          )}
        </div>
        {this.renderRightBar()}
      </div>
    )
  }
}
