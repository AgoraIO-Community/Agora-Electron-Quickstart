import { Component } from 'react'
import AgoraRtcEngine, {
  AREA_CODE,
  LOG_LEVEL,
  EngineEvents,
  VideoSourceType,
  CLIENT_ROLE_TYPE,
  CHANNEL_PROFILE_TYPE,
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
  /**
   * 1: don't register
   * 2: register before join channel
   * 3: register after join channel
   */

  pluginState: 1 | 2 | 3
  currentFps?: number
  currentResolution?: { width: number; height: number }
  screenInfoList: any[]
  windowInfoList: any[]
  localVideoSourceUid?: number
  selectedShareInfo?: { type: 'screen' | 'window'; info: any }
  shared: Boolean
}

const SCREEN_SHARE_ID = 99

export default class ScreenShare extends Component<{}, State, any> {
  rtcEngine?: AgoraRtcEngine

  state: State = {
    /**
     * 1: don't register
     * 2: register before join channel
     * 3: register after join channel
     */
    pluginState: 1,
    screenInfoList: [],
    windowInfoList: [],
    shared: false,
  }

  componentDidMount = async () => {
    this.getRtcEngine().enableVideo()

    await this.getWindowInfoList()
    await this.getScreenInfoList()
  }

  componentWillUnmount() {
    this.onPressStopSharing()
    this.getRtcEngine().release()
  }

  getScreenInfoList = async () => {
    const list = this.getRtcEngine().getScreensInfo()
    const imageListPromise = list.map((item) => readImage(item.image))
    const imageList = await Promise.all(imageListPromise)
    const screenInfoList = list.map(({ displayId }, index) => ({
      name: `Display ${index + 1}`,
      image: imageList[index],
      displayId,
    }))

    this.setState({ screenInfoList })
  }

  getWindowInfoList = async () => {
    const list = this.getRtcEngine().getWindowsInfo()

    const imageListPromise = list.map((item) => readImage(item.image))
    const imageList = await Promise.all(imageListPromise)

    const windowInfoList = list.map(({ ownerName, name, windowId }, index) => ({
      ownerName,
      image: imageList[index],
      windowId,
      name:
        name.length < 20
          ? name
          : name.replace(/\s+/g, '').substr(0, 20) + '...',
    }))
    this.setState({ windowInfoList })
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      window.rtcEngine = this.rtcEngine
      this.subscribeEvents(this.rtcEngine)
      const res = this.rtcEngine?.initialize({
        appId: config.appID,
        areaCode: AREA_CODE.AREA_CODE_GLOB,
        logConfig: {
          level: LOG_LEVEL.LOG_LEVEL_INFO,
          filePath: config.nativeSDKLogPath,
          fileSize: 2000,
        },
      })
      this.rtcEngine.setAddonLogFile(config.addonLogPath)
      console.log('initialize:', res)
    }
    return this.rtcEngine
  }

  registerPlugin = () => {
    console.log('----------registerPlugin--------')
    const rtcEngine = this.getRtcEngine()
    if (!config.pluginPath) {
      message.error('Please set plugin path')
    }
  }

  subscribeEvents = (rtcEngine: AgoraRtcEngine) => {
    rtcEngine.on(EngineEvents.JOINED_CHANNEL, (connection, elapsed) => {
      console.log(
        `onJoinChannel channel: ${connection.channelId}  uid: ${
          connection.localUid
        }  version: ${JSON.stringify(rtcEngine.getVersion())})`
      )

      console.log('localVideoSourceUid', connection.localUid)
      this.setState({
        localVideoSourceUid: connection.localUid,
      })
    })
    rtcEngine.on(EngineEvents.USER_JOINED, (uid, elapsed) => {
      console.log(`userJoined ---- ${uid}`)
    })
    rtcEngine.on(EngineEvents.USER_OFFLINE, (uid, reason) => {})

    rtcEngine.on(EngineEvents.ERROR, (err) => {
      console.error(err)
    })
    rtcEngine.on(
      EngineEvents.FIRST_LOCAL_VIDEO_FRAME,
      (width, height, elapsed) => {
        console.log(`firstLocalVideoFrame width: ${width}, ${height}`)
      }
    )
  }

  startScreenOrWindowCapture = (type: string, screenSymbol: any) => {
    const rtcEngine = this.getRtcEngine()
    console.log(`start sharing display ${JSON.stringify(screenSymbol)}`)
    const excludeList = new Array<number>()
    var res = -1
    if (type === 'screen') {
      const res = rtcEngine.startScreenCaptureByScreen(
        screenSymbol,
        {
          x: screenSymbol.x,
          y: screenSymbol.y,
          width: screenSymbol.width,
          height: screenSymbol.height,
        },
        {
          dimensions: {
            width: screenSymbol.width,
            height: screenSymbol.height,
          },
          bitrate: 2000,
          frameRate: 5,
          captureMouseCursor: true,
          windowFocus: false,
          excludeWindowList: excludeList,
          excludeWindowCount: excludeList.length,
        }
      )
      console.log('startScreenCaptureByScreen:', res)
    } else {
      const info = this.state.windowInfoList.find((obj) => {
        if (obj.windowId == screenSymbol) return obj
      })
      const res = rtcEngine.startScreenCaptureByWindow(
        screenSymbol,
        {
          x: info.x,
          y: info.y,
          width: info.originWidth,
          height: info.originHeight,
        },
        {
          dimensions: { width: info.originWidth, height: info.originHeight },
          bitrate: 2000,
          frameRate: 15,
          captureMouseCursor: true,
          windowFocus: false,
          excludeWindowList: excludeList,
          excludeWindowCount: excludeList.length,
        }
      )
      console.log('startScreenCaptureByWindow:', res)
    }

    if (res != 0) this.setState({ shared: false })
    else this.setState({ shared: true })
  }

  JoinChannel = (
    channelId: string,
    info = '',
    timeout = 5000
  ): Promise<boolean> =>
    new Promise((resolve, reject) => {
      const localUid = getRandomInt(1, 9999999)
      const timer = setTimeout(() => {
        reject(new Error('Join Channel Timeout'))
      }, timeout)
      const rtcEngine = this.getRtcEngine()
      rtcEngine.once(EngineEvents.JOINED_CHANNEL, (connection, elapsed) => {
        clearTimeout(timer)
        if (localUid !== connection.localUid) {
          return
        }
        resolve(true)
        console.log(
          `onJoinChannel channel: ${connection.channelId}  uid: ${
            connection.localUid
          }  version: ${JSON.stringify(rtcEngine.getVersion())})`
        )
      })

      rtcEngine.once(EngineEvents.LEAVE_CHANNEL, () => {
        console.log(`LeaveChannel`)
      })
      try {
        console.log(`localUid: ${localUid}`)
        this.rtcEngine?.joinChannelEx(
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
            publishScreenTrack: true,
            clientRoleType: CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER,
            channelProfile:
              CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_LIVE_BROADCASTING,
            encodedVideoTrackOption: { targetBitrate: 2000 },
          }
        )
      } catch (err) {
        clearTimeout(timer)
        reject(err)
      }
    })

  onPressStartShare = async (channelId: string) => {
    const { selectedShareInfo, pluginState } = this.state

    if (!selectedShareInfo) {
      message.error('Must select a window/screen to share')
      return true
    }

    const {
      info: { displayId, windowId },
      type,
    } = selectedShareInfo

    try {
      await this.startScreenOrWindowCapture(type, displayId || windowId)
      const res = await this.JoinChannel(channelId)
      return false
    } catch (error) {
      console.error(error)
    }
    console.log('----4')
    return true
  }

  onPressStopSharing = () => {
    const shared = this.state
    if (shared) {
      const rtcEngine = this.getRtcEngine()
      rtcEngine.stopScreenCapture()
      rtcEngine.leaveChannel()
      this.setState({ localVideoSourceUid: undefined, shared: false })
    }
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
    const { windowInfoList, screenInfoList, selectedShareInfo, pluginState } =
      this.state
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
