import { Card, Switch } from 'antd'
import electron, { ipcRenderer } from "electron";
import creteAgoraRtcEngine, {
  ClientRoleType,
  DegradationPreference,
  IRtcEngine,
  IRtcEngineEventHandler,
  IRtcEngineEx,
  IVideoDeviceManager,
  OrientationMode,
  RtcEngineExImplInternal,
  VideoCodecType,
  VideoMirrorModeType,
  VideoSourceType,
} from 'electron-agora-rtc-ng'
import { Component } from 'react'
import DropDownButton from '../../component/DropDownButton'
import JoinChannelBar from '../../component/JoinChannelBar'
import Window from '../../component/Window'
import { FpsMap, ResolutionMap } from '../../config'
import config from '../../config/agora.config'
import styles from '../../config/public.scss'
import { configMapToOptions, getRandomInt } from '../../util'
import { rgbImageBufferToBase64 } from '../../util/base64'
import screenStyle from './CameraAndScreenShare.scss'

const desktopCapturer = {
  getSources: (opts) =>
    ipcRenderer.invoke("DESKTOP_CAPTURER_GET_SOURCES", {
      types: ["window", "screen"],
    }),
};
//@ts-ignore
window.desktopCapturer = desktopCapturer;

const localUid1 = getRandomInt(1, 9999999)
const localUid2 = getRandomInt(1, 9999999)

interface State {
  captureInfoList: any[]
  currentShareInfo?: any
  channelId: string
  isStart: boolean
  cameraDevices: Device[]
  firstCameraId: string
  enableShare: boolean
  currentFps?: number
  currentResolution?: { width: number; height: number }
  currentShareFps?: number
  currentShareResolution?: { width: number; height: number }
  captureMouseCursor: boolean
}
interface Device {
  deviceId: string
  deviceName: string
}

export default class CameraAndScreenShare
  extends Component<{}, State, any>
  implements IRtcEngineEventHandler
{
  videoDeviceManager: IVideoDeviceManager

  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  state: State = {
    captureInfoList: [],
    channelId: '',
    isStart: false,
    cameraDevices: [],
    firstCameraId: '',
    enableShare: true,
    // enableCamera: true,
    captureMouseCursor: true,
  }

  componentDidMount = async () => {
    this.getScreenCaptureInfo()

    this.getRtcEngine().registerEventHandler(this)

    this.videoDeviceManager = this.getRtcEngine().getVideoDeviceManager()

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
    console.log(list,imageList,formatList);
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

  onError(err: number, msg: string): void {
    console.error(err, msg)
  }

  startScreenCapture = (channelId: string) => {
    const {
      currentShareInfo,
      enableShare,
      currentFps,
      currentShareResolution,
      captureMouseCursor,
    } = this.state

    const { isScreen, sourceId } = currentShareInfo
    console.log(currentShareInfo)

    const rtcEngine = this.getRtcEngine()
    if (isScreen) {
      if (process.platform=='darwin') {
        this.rtcEngine.startScreenCaptureByDisplayId(
          sourceId,
          {
            x: 0,
            y: 0,
            ...currentShareResolution,
          },
          {
            dimensions: currentShareResolution,
  
            frameRate: currentFps,
            captureMouseCursor,
            windowFocus: false,
            excludeWindowList: [],
            excludeWindowCount: 0,
          }
        )
      } else {
        this.rtcEngine.startScreenCaptureByScreenRect(
          {
            x: 0,
            y: 0,
            ...currentShareResolution,
          },
          {
            x: 0,
            y: 0,
            ...currentShareResolution,
          },
          {
            dimensions: currentShareResolution,
  
            frameRate: currentFps,
            captureMouseCursor,
            windowFocus: false,
            excludeWindowList: [],
            excludeWindowCount: 0,
          }
        )
      }
      
    } else {
      this.rtcEngine.startScreenCaptureByWindowId(
        sourceId,
        {
          x: 0,
          y: 0,
          ...currentShareResolution,
        },
        {
          dimensions: currentShareResolution,
          frameRate: currentFps,
          captureMouseCursor,
          windowFocus: false,
          excludeWindowList: [],
          excludeWindowCount: 0,
        }
      )
    }

    const res = rtcEngine.joinChannelEx(
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
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      }
    )
    console.log('joinChannelEx', res)
  }

  onPressStart = async (channelId: string) => {
    this.setState({ channelId, isStart: true })
    await this.startScreenCapture(channelId)

    return false
  }

  onPressStop = () => {
    this.setState({ isStart: false })
    const rtcEngine = this.getRtcEngine()
    
    rtcEngine.stopScreenCapture();

    const { channelId } = this.state
    rtcEngine.leaveChannelEx({ channelId, localUid: localUid1 })
    rtcEngine.leaveChannelEx({ channelId, localUid: localUid2 })
  }

  updateScreenCaptureParameters = () => {
    const { currentShareResolution, currentShareFps, captureMouseCursor } =
      this.state

    if (!currentShareResolution || !currentShareFps) {
      return
    }
    const res = this.rtcEngine.updateScreenCaptureParameters({
      dimensions: currentShareResolution,
      frameRate: currentShareFps,
      captureMouseCursor,
      windowFocus: false,
      excludeWindowList: [],
      excludeWindowCount: 0,
    })
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
    const { captureInfoList, cameraDevices, enableShare } =
      this.state
    return (
      <div className={styles.rightBar}>
        <div>
          <div>Please Select camera and screen </div>

          <DropDownButton
            defaultIndex={0}
            title='Share Window/Screen'
            options={captureInfoList.map((obj) => ({
              dropId: obj,
              dropText: obj.sourceName || obj.sourceTitle,
            }))}
            // PopContent={this.renderPopup}
            PopContentTitle='Preview'
            onPress={(res) => {
              const info = res.dropId
              if (info === undefined) {
                return
              }
              this.setState({ currentShareInfo: info })
            }}
          />
          <DropDownButton
            title='Resolution'
            options={configMapToOptions(ResolutionMap)}
            defaultIndex={configMapToOptions(ResolutionMap).length - 1}
            onPress={(res) => {
              this.setState(
                { currentShareResolution: res.dropId },
                this.updateScreenCaptureParameters
              )
            }}
          />
          <DropDownButton
            title='FPS'
            options={configMapToOptions(FpsMap)}
            onPress={(res) => {
              this.setState(
                { currentShareFps: res.dropId },
                this.updateScreenCaptureParameters
              )
            }}
          />
          <div
            style={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            {'CaptureMouseCursor'}
            <Switch
              checkedChildren='Enable'
              unCheckedChildren='Disable'
              defaultChecked={false}
              onChange={(enable) => {
                this.setState(
                  { captureMouseCursor: enable },
                  this.updateScreenCaptureParameters
                )
              }}
            />
          </div>
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
    const { isStart, channelId, enableShare } = this.state
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
            </>
          )}
        </div>
        {this.renderRightBar()}
      </div>
    )
  }
}
