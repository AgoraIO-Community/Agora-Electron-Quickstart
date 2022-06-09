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
  LocalTranscoderConfiguration,
  MediaSourceType,
  OrientationMode,
  RtcConnection,
  RtcEngineExImplInternal,
  RtcStats,
  TranscodingVideoStream,
  UserOfflineReasonType,
  VideoCodecType,
  VideoMirrorModeType,
  VideoSourceType,
} from 'agora-electron-sdk'
import { Card, List, Switch } from 'antd'
import { Component } from 'react'
import DropDownButton from '../../component/DropDownButton'
import JoinChannelBar from '../../component/JoinChannelBar'
import Window from '../../component/Window'
import { FpsMap, ResolutionMap, RoleTypeMap } from '../../config'
import config from '../../config/agora.config'
import styles from '../../config/public.scss'
import { configMapToOptions, getRandomInt } from '../../util'

const localUid1 = getRandomInt()
const localUid2 = getRandomInt()

interface Device {
  deviceId: string
  deviceName: string
}

interface User {
  isMyself: boolean
  uid: number
}

interface State {
  isJoined: boolean
  channelId: string
  allUser: User[]
  audioRecordDevices: Device[]
  cameraDevices: Device[]
  currentFps?: number
  currentResolution?: { width: number; height: number }
  isAddScreenShare: boolean
  videoDeviceId: string
}

export default class LocalVideoTranscoder
  extends Component<{}, State, any>
  implements IRtcEngineEventHandlerEx
{
  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  videoDeviceManager: IVideoDeviceManagerImpl

  audioDeviceManager: IAudioDeviceManagerImpl

  state: State = {
    channelId: '',
    allUser: [],
    isJoined: false,
    audioRecordDevices: [],
    cameraDevices: [],
    isAddScreenShare: false,
    videoDeviceId: '',
  }

  componentDidMount() {
    const rtcEngine = this.getRtcEngine()

    this.getRtcEngine().registerEventHandler(this)
    this.videoDeviceManager = new IVideoDeviceManagerImpl()
    this.audioDeviceManager = new IAudioDeviceManagerImpl()

    this.setState({
      audioRecordDevices:
        this.audioDeviceManager.enumerateRecordingDevices() as any,
      cameraDevices: this.videoDeviceManager.enumerateVideoDevices() as any,
    })
  }

  componentWillUnmount() {
    this.rtcEngine?.unregisterEventHandler(this)
    this.onPressLeaveChannel()
    this.rtcEngine?.release()
  }

  getRtcEngine() {
    if (!this.rtcEngine) {
      this.rtcEngine = creteAgoraRtcEngine()
      //@ts-ignore
      window.rtcEngine = this.rtcEngine
      const res = this.rtcEngine.initialize({
        appId: config.appID,
      })
      this.rtcEngine.setLogFile(config.nativeSDKLogPath)
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
    newAllUser.push({ isMyself: true, uid: localUid })
    this.setState({
      isJoined: true,
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

  onUserOfflineEx(
    { localUid, channelId }: RtcConnection,
    remoteUid: number,
    reason: UserOfflineReasonType
  ): void {
    console.log('onUserOfflineEx', channelId, remoteUid)

    const { allUser: oldAllUser } = this.state
    const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== remoteUid)]
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

  onSnapshotTaken(
    channel: string,
    uid: number,
    filePath: string,
    width: number,
    height: number,
    errCode: number
  ): void {
    console.log(
      'onSnapshotTaken',
      channel,
      uid,
      filePath,
      width,
      height,
      errCode
    )
  }

  onPressJoinChannel = (channelId: string) => {
    this.setState({ channelId })
    const { videoDeviceId } = this.state
    this.rtcEngine.enableAudio()
    this.rtcEngine.enableVideo()
    this.rtcEngine?.setChannelProfile(
      ChannelProfileType.ChannelProfileLiveBroadcasting
    )
    this.rtcEngine?.setAudioProfile(
      AudioProfileType.AudioProfileDefault,
      AudioScenarioType.AudioScenarioChatroom
    )
    this.rtcEngine.startPrimaryCameraCapture({
      deviceId: videoDeviceId,
    })
    const config = this.getLocalTranscoderConfiguration()
    this.rtcEngine.startLocalVideoTranscoder(config)
    this.rtcEngine.joinChannel2('', channelId, localUid1, {
      publishCameraTrack: false,
      publishScreenTrack: false,
      publishTrancodedVideoTrack: true,
    })
  }

  setVideoConfig = () => {
    const { currentFps, currentResolution } = this.state
    if (!currentResolution || !currentFps) {
      return
    }

    this.getRtcEngine().setVideoEncoderConfiguration({
      codecType: VideoCodecType.VideoCodecH264,
      dimensions: currentResolution!,
      frameRate: currentFps,
      bitrate: 65,
      minBitrate: 1,
      orientationMode: OrientationMode.OrientationModeAdaptive,
      degradationPreference: DegradationPreference.MaintainBalanced,
      mirrorMode: VideoMirrorModeType.VideoMirrorModeAuto,
    })
  }
  getLocalTranscoderConfiguration = () => {
    const { isAddScreenShare } = this.state
    const cameraStream = {
      sourceType: MediaSourceType.PrimaryCameraSource,
      x: 0,
      y: 0,
      width: 640,
      height: 320,
      zOrder: 1,
      alpha: 1,
      mirror: true,
    }
    const streams: TranscodingVideoStream[] = [cameraStream]
    if (isAddScreenShare) {
      const screenShareStream = {
        sourceType: MediaSourceType.PrimaryScreenSource,
        x: 0,
        y: 320,
        width: 640,
        height: 320,
        zOrder: 1,
        alpha: 1,
        mirror: true,
      }
      streams.push(screenShareStream)
    }
    const config: LocalTranscoderConfiguration = {
      streamCount: streams.length,
      VideoInputStreams: streams,
      videoOutputConfiguration: { dimensions: { width: 1080, height: 720 } },
    }
    return config
  }

  onPressLeaveChannel = () => {
    this.rtcEngine?.leaveChannel()
    this.rtcEngine?.stopLocalVideoTranscoder()
  }

  onPressAddScreenScreen = (enabled) => {
    this.setState({ isAddScreenShare: enabled })
    const rtcEngine = this.getRtcEngine()
    if (enabled) {
      const list = rtcEngine
        .getScreenCaptureSources(
          { width: 0, height: 0 },
          { width: 0, height: 0 },
          true
        )
        .filter((info) => info.primaryMonitor)
      if (list.length !== 1) {
        return
      }
      const sourceId = list[0].sourceId
      const res = rtcEngine.startPrimaryScreenCapture({
        isCaptureWindow: false,
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
    } else {
      rtcEngine.stopPrimaryScreenCapture()
    }
  }

  renderRightBar = () => {
    const { audioRecordDevices, cameraDevices, isJoined } = this.state

    return (
      <div className={styles.rightBar}>
        <div>
          <DropDownButton
            options={cameraDevices.map((obj) => {
              const { deviceId, deviceName } = obj
              return { dropId: deviceId, dropText: deviceName, ...obj }
            })}
            onPress={(res) => {
              this.setState({ videoDeviceId: res.dropId })
            }}
            title='Camera'
          />
          <DropDownButton
            title='Microphone'
            options={audioRecordDevices.map((obj) => {
              const { deviceId, deviceName } = obj
              return { dropId: deviceId, dropText: deviceName, ...obj }
            })}
            onPress={(res) => {
              this.audioDeviceManager.setRecordingDevice(res.dropId)
            }}
          />
          <DropDownButton
            title='Role'
            options={configMapToOptions(RoleTypeMap)}
            onPress={(res) => {
              this.getRtcEngine().setClientRole(res.dropId)
            }}
          />
          <DropDownButton
            title='Resolution'
            options={configMapToOptions(ResolutionMap)}
            onPress={(res) => {
              this.setState(
                { currentResolution: res.dropId },
                this.setVideoConfig
              )
            }}
          />
          <DropDownButton
            title='FPS'
            options={configMapToOptions(FpsMap)}
            onPress={(res) => {
              this.setState({ currentFps: res.dropId }, this.setVideoConfig)
            }}
          />
          <br></br>
          <div
            style={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            {'Add Screen Share'}
            <Switch
              checkedChildren='Enable'
              unCheckedChildren='Disable'
              defaultChecked={false}
              onChange={this.onPressAddScreenScreen}
            />
          </div>
          <br></br>
        </div>
        <JoinChannelBar
          onPressJoin={this.onPressJoinChannel}
          onPressLeave={this.onPressLeaveChannel}
        />
      </div>
    )
  }

  renderItem = ({ isMyself, uid }: User) => {
    const { channelId } = this.state
    const videoSourceType = isMyself
      ? VideoSourceType.VideoSourceTranscoded
      : VideoSourceType.VideoSourceRemote

    return (
      <List.Item>
        <Card title={`${isMyself ? 'Local' : 'Remote'} Uid: ${uid}`}>
          <Window
            uid={uid}
            rtcEngine={this.rtcEngine!}
            videoSourceType={videoSourceType}
            channelId={channelId}
          />
        </Card>
      </List.Item>
    )
  }

  render() {
    const { isJoined, allUser } = this.state
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {isJoined && (
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
              dataSource={allUser}
              renderItem={this.renderItem}
            />
          )}
        </div>
        {this.renderRightBar()}
      </div>
    )
  }
}
