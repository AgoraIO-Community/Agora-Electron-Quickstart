import creteAgoraRtcEngine, {
  AudioProfileType,
  AudioScenarioType,
  ChannelProfileType,
  IAudioDeviceManagerImpl,
  IRtcEngine,
  IRtcEngineEventHandlerEx,
  IRtcEngineEx,
  RtcConnection,
  RtcEngineExImplInternal,
  RtcStats,
  UserOfflineReasonType,
} from 'agora-electron-sdk'
import { Button, Card, List } from 'antd'
import { Component } from 'react'
import DropDownButton from '../../component/DropDownButton'
import JoinChannelBar from '../../component/JoinChannelBar'
import SliderBar from '../../component/SliderBar'
import { AudioProfileList, AudioScenarioList } from '../../config'
import config from '../../config/agora.config'
import styles from '../../config/public.scss'
import { configMapToOptions, getRandomInt, getResourcePath } from '../../util'

const EFFECT_ID = 1

interface User {
  isMyself: boolean
  uid: number
}

interface Device {
  deviceName: string
  deviceId: string
}
interface State {
  audioRecordDevices: Device[]
  audioProfile: number
  audioScenario: number
  allUser: User[]
  isJoined: boolean
}

export default class AudioMixing
  extends Component<{}, State, any>
  implements IRtcEngineEventHandlerEx
{
  rtcEngine?: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal

  audioDeviceManager: IAudioDeviceManagerImpl

  state: State = {
    audioRecordDevices: [],
    audioProfile: AudioProfileList.SpeechStandard,
    audioScenario: AudioScenarioList.Standard,
    allUser: [],
    isJoined: false,
  }

  componentDidMount() {
    this.getRtcEngine().registerEventHandler(this)
    this.audioDeviceManager = new IAudioDeviceManagerImpl()

    this.setState({
      audioRecordDevices:
        this.audioDeviceManager.enumerateRecordingDevices() as any,
    })
  }

  componentWillUnmount() {
    this.getRtcEngine().unregisterEventHandler(this)
    this.rtcEngine?.leaveChannel()
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

  setAudioProfile = () => {
    const { audioProfile, audioScenario } = this.state
    this.rtcEngine?.setAudioProfile(audioProfile, audioScenario)
  }

  renderItem = ({ isMyself, uid }: User) => {
    return (
      <List.Item>
        <Card title={`${isMyself ? 'Local' : 'Remote'} `}>Uid: {uid}</Card>
      </List.Item>
    )
  }

  renderRightBar = () => {
    const { audioRecordDevices } = this.state
    return (
      <div className={styles.rightBar} style={{ width: '60%' }}>
        <div style={{ overflow: 'auto' }}>
          <DropDownButton
            options={configMapToOptions(AudioProfileList)}
            onPress={(res) =>
              this.setState({ audioProfile: res.dropId }, this.setAudioProfile)
            }
            title='Audio Profile'
          />
          <DropDownButton
            options={configMapToOptions(AudioScenarioList)}
            onPress={(res) =>
              this.setState({ audioScenario: res.dropId }, this.setAudioProfile)
            }
            title='Audio Scenario'
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
          <SliderBar
            max={100}
            title='Mixing Volume'
            onChange={(value) => {
              this.rtcEngine?.adjustAudioMixingVolume(value)
            }}
          />
          <SliderBar
            max={100}
            title='Mixing Playback Volume'
            onChange={(value) => {
              this.rtcEngine?.adjustAudioMixingPlayoutVolume(value)
            }}
          />
          <SliderBar
            max={100}
            title='Mixing Publish Volume'
            onChange={(value) => {
              this.rtcEngine?.adjustAudioMixingPublishVolume(value)
            }}
          />
          <p>Audio Effect Controls</p>
          <Button
            htmlType='button'
            onClick={() => {
              const mp3Path = getResourcePath('audioEffect.mp3')

              this.getRtcEngine().playEffect(
                EFFECT_ID,
                mp3Path,
                -1,
                1,
                0,
                100,
                true,
                0
              )
            }}
          >
            Play
          </Button>
          <Button
            htmlType='button'
            onClick={() => {
              this.getRtcEngine().resumeEffect(EFFECT_ID)
            }}
          >
            Resume
          </Button>
          <Button
            htmlType='button'
            onClick={() => {
              this.getRtcEngine().pauseEffect(EFFECT_ID)
            }}
          >
            Pause
          </Button>
          <Button
            htmlType='button'
            onClick={() => {
              this.getRtcEngine().stopEffect(EFFECT_ID)
            }}
          >
            Stop
          </Button>
          <SliderBar
            max={100}
            title='Effect Volume'
            onChange={(value) => {
              this.getRtcEngine().setEffectsVolume(value)
            }}
          />
          <SliderBar
            max={100}
            title='Loopback Recording Volume'
            onChange={(value) => {
              this.rtcEngine?.adjustLoopbackRecordingVolume(value)
            }}
          />
          <Button
            htmlType='button'
            onClick={() => {
              this.getRtcEngine().enableLoopbackRecording(true)
            }}
          >
            enable
          </Button>
          <Button
            htmlType='button'
            onClick={() => {
              this.getRtcEngine().enableLoopbackRecording(false)
            }}
          >
            disable
          </Button>
        </div>
        <JoinChannelBar
          onPressJoin={(channelId: string) => {
            this.getRtcEngine().enableAudio()
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
          }}
          onPressLeave={() => {
            this.getRtcEngine().leaveChannel()
          }}
        />
      </div>
    )
  }

  render() {
    const { isJoined, allUser } = this.state
    return (
      <div className={styles.screen}>
        <div className={styles.content}>
          {isJoined && (
            <List
              style={{ width: '100%' }}
              grid={{ gutter: 16, column: 4 }}
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
