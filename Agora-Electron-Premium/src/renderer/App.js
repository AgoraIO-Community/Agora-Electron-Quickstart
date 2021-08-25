import React, { Component } from 'react'
import AgoraRtcEngine from 'agora-electron-sdk'
import {
  voiceChangerList,
  videoProfileList,
  audioProfileList,
  audioScenarioList,
  SHARE_ID,
  RTMP_URL,
  LOCAL_USER_ID,
  voiceReverbList,
} from '../utils/settings'
import { readImage } from '../utils/base64'
import WindowPicker from './components/WindowPicker/index.js'
import DisplayPicker from './components/DisplayPicker/index.js'
import Window from './components/Window'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      appid: '',
      token: '',
      local: '',
      isShowLocalVideoSource: '',
      localSharing: false,
      users: [],
      channel: 'test',
      role: 1,
      voiceReverbPreset: 0,
      voiceChangerPreset: 0,
      videoDevices: [],
      audioDevices: [],
      audioPlaybackDevices: [],
      camera: 0,
      mic: 0,
      speaker: 0,
      encoderConfiguration: 3,
      showScreenPicker: false,
      showDisplayPicker: false,
      recordingTestOn: false,
      playbackTestOn: false,
      lastmileTestOn: false,
      rtmpTestOn: false,
      windowList: [],
      displayList: [],
      screenShareConnectionId: 0
    }
  }

  getRtcEngine() {
    if (!this.state.appid) {
      alert('Please enter appid')
      return
    }
    if (!this.rtcEngine) {
      this.rtcEngine = new AgoraRtcEngine()
      this.rtcEngine.initialize(this.state.appid)
      let ret = this.rtcEngine.setLogFileSize(2000)
      console.log(`setLogFileSize ${ret}`)
      this.rtcEngine.setLogFile('./Agora_SDK_Log.txt')
      this.subscribeEvents(this.rtcEngine)
      window.rtcEngine = this.rtcEngine

      this.setState({
        videoDevices: rtcEngine.getVideoDevices(),
        audioDevices: rtcEngine.getAudioRecordingDevices(),
        audioPlaybackDevices: rtcEngine.getAudioPlaybackDevices(),
      })
    }

    return this.rtcEngine
  }

  subscribeEvents = (rtcEngine) => {
    rtcEngine.on('joinedchannel', (connId, channel, uid, elapsed) => {
      if (uid === SHARE_ID) {
        return
      }
      console.log(
        `onJoinChannel channel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          rtcEngine.getVersion()
        )})`
      )
      this.setState({
        local: uid,
      })
      let ret = rtcEngine.addPublishStreamUrl(
        'rtmp://vid-218.push.chinanetcenter.broadcastapp.agora.io/live/rawPublishStrem',
        false
      )
      console.log(`addPublishStreamUrl ret: ${ret}`)
    })
    rtcEngine.on('userjoined', (connId, uid, elapsed) => {
      if (
        [SHARE_ID, LOCAL_USER_ID].includes(uid) ||
        this.state.users.includes(uid)
      ) {
        return
      }
      console.log(`userJoined ---- ${uid}`)
      rtcEngine.muteRemoteVideoStream(uid, false)
      this.setState({
        users: this.state.users.concat([uid]),
      })
    })
    rtcEngine.on('removestream', (connId, uid, reason) => {
      console.log(`useroffline ${uid}`)
      this.setState({
        users: this.state.users.filter((u) => u != uid),
      })
    })
    rtcEngine.on('leavechannel', (connId, rtcStats) => {
      console.log(`onleaveChannel----`)
      this.setState({
        local: '',
        users: [],
        localSharing: false,
        isShowLocalVideoSource: '',
      })
    })
    rtcEngine.on('audiodevicestatechanged', () => {
      this.setState({
        audioDevices: rtcEngine.getAudioRecordingDevices(),
        audioPlaybackDevices: rtcEngine.getAudioPlaybackDevices(),
      })
    })
    rtcEngine.on('videodevicestatechanged', () => {
      this.setState({
        videoDevices: rtcEngine.getVideoDevices(),
      })
    })
    rtcEngine.on('streamPublished', (url, error) => {
      console.log(`url: ${url}, err: ${error}`)
    })
    rtcEngine.on('streamUnpublished', (url) => {
      console.log(`url: ${url}`)
    })
    rtcEngine.on('lastmileProbeResult', (result) => {
      console.log(`lastmileproberesult: ${JSON.stringify(result)}`)
    })
    rtcEngine.on('lastMileQuality', (quality) => {
      console.log(`lastmilequality: ${JSON.stringify(quality)}`)
    })
    rtcEngine.on(
      'audiovolumeindication',
      (connId, speakers, speakerNumber, totalVolume) => {
        console.log(
          `uid${uid} volume${volume} speakerNumber${speakerNumber} totalVolume${totalVolume}`
        )
      }
    )
    rtcEngine.on('error', (connId, err, msg) => {
      console.error(err)
    })
  }

  handleJoin = () => {
    if (!this.state.channel) {
      alert('Please enter channel')
      return
    }
    let rtcEngine = this.getRtcEngine()
    rtcEngine.setLogFile('./agora_native.log')
    rtcEngine.setChannelProfile(1)
    rtcEngine.setClientRole(this.state.role)
    rtcEngine.setAudioProfile(0, 1)
    rtcEngine.enableVideo()

    rtcEngine.enableWebSdkInteroperability(true)
    let encoderProfile = videoProfileList[this.state.encoderConfiguration]
    let rett = rtcEngine.setVideoEncoderConfiguration({
      width: encoderProfile.width,
      height: encoderProfile.height,
      frameRate: encoderProfile.fps,
      bitrate: encoderProfile.bitrate,
    })
    console.log(
      `setVideoEncoderConfiguration --- ${JSON.stringify(
        encoderProfile
      )}  ret: ${rett}`
    )

    let ret1 = rtcEngine.setLocalVoiceChanger(this.state.voiceChangerPreset)
    console.log(
      `setLocalVoiceChanger : ${ret1} -- e ${this.state.voiceChangerPreset}`
    )

    let ret2 = rtcEngine.setLocalVoiceReverbPreset(this.state.voiceReverbPreset)
    console.log(
      `setLocalVoiceReverbPreset : ${ret2} -- e ${this.state.voiceReverbPreset}`
    )

    if (this.state.videoDevices.length > 0) {
      rtcEngine.setVideoDevice(
        this.state.videoDevices[this.state.camera].deviceid
      )
    }
    if (this.state.audioDevices.length > 0) {
      rtcEngine.setAudioRecordingDevice(
        this.state.audioDevices[this.state.mic].deviceid
      )
    }
    if (this.state.audioPlaybackDevices.length > 0) {
      rtcEngine.setAudioPlaybackDevice(
        this.state.audioDevices[this.state.speaker].deviceid
      )
    }

    rtcEngine.enableDualStreamMode(true)
    rtcEngine.enableAudioVolumeIndication(1000, 3, false)

    rtcEngine.setRenderMode(2)
    rtcEngine.joinChannel(
      this.state.token || null,
      this.state.channel,
      '',
      LOCAL_USER_ID
    )
  }

  handleLeave = () => {
    let rtcEngine = this.getRtcEngine()
    rtcEngine.leaveChannel()
    rtcEngine.leaveChannelEx(this.state.channel, this.state.screenShareConnectionId)
  }

  handleCameraChange = (e) => {
    this.setState({ camera: e.currentTarget.value })
    this.getRtcEngine().setVideoDevice(
      this.state.videoDevices[e.currentTarget.value].deviceid
    )
  }

  handleMicChange = (e) => {
    this.setState({ mic: e.currentTarget.value })
    this.getRtcEngine().setAudioRecordingDevice(
      this.state.audioDevices[e.currentTarget.value].deviceid
    )
  }

  handleSpeakerChange = (e) => {
    this.setState({ speaker: e.currentTarget.value })
    this.getRtcEngine().setAudioPlaybackDevice(
      this.state.audioPlaybackDevices[e.currentTarget.value].deviceid
    )
  }

  handleEncoderConfiguration = (e) => {
    this.setState({
      encoderConfiguration: Number(e.currentTarget.value),
    })
  }

  handleVoiceChanger = (e) => {
    console.log(`handleVoiceChanger  ${e.currentTarget.value}`)
    this.setState(
      {
        voiceChangerPreset: Number(e.currentTarget.value),
      },
      () => {
        this.rtcEngine.setLocalVoiceChanger(this.state.voiceChangerPreset)
      }
    )
  }

  handleVoiceReverbPreset = (e) => {
    console.log(`handleVoiceReverbPreset  ${e.currentTarget.value}`)
    this.setState({
      voiceReverbPreset: Number(e.currentTarget.value),
    })
  }

  /**
   * start screen share
   * @param {*} windowId windows id to capture
   * @param {*} captureFreq fps of video source screencapture, 1 - 15
   * @param {*} rect null/if specified, {x: 0, y: 0, width: 0, height: 0}
   * @param {*} bitrate bitrate of video source screencapture
   */
  startScreenShare(
    windowId = 0,
    captureFreq = 15,
    rect = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    bitrate = 0
  ) {
    let rtcEngine = this.getRtcEngine()
    // rtcEngine.startScreenCapture2(windowId, captureFreq, rect, bitrate);
    // there's a known limitation that, videosourcesetvideoprofile has to be called at least once
    // note although it's called, it's not taking any effect, to control the screenshare dimension, use captureParam instead
    let res = rtcEngine.startScreenCaptureByWindow(
      windowId,
      { x: 0, y: 0, width: 0, height: 0 },
      {
        width: 1920,
        height: 1080,
        bitrate: 500,
        frameRate: 15,
        captureMouseCursor: false,
        windowFocus: false,
      }
    )
    this.state.screenShareConnectionId = rtcEngine.joinChannelEx('', this.state.channel, SHARE_ID, {
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
    })
  }

  startScreenShareByDisplay(displayId) {
    let rtcEngine = this.getRtcEngine()

    let excludeWindowList = []

    rtcEngine.startScreenCaptureByScreen(
      displayId,
      { x: 0, y: 0, width: 0, height: 0 },
      {
        width: 1920,
        height: 1080,
        bitrate: 1000,
        frameRate: 15,
        captureMouseCursor: false,
        windowFocus: false,
        excludeWindowList,
        excludeWindowCount: excludeWindowList.length,
      }
    )
    this.state.screenShareConnectionId = rtcEngine.joinChannelEx('', this.state.channel, SHARE_ID, {
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
    })
  }

  handleScreenSharing = (e) => {
    // getWindowInfo and open Modal
    let rtcEngine = this.getRtcEngine()
    let list = rtcEngine.getScreenWindowsInfo()
    Promise.all(list.map((item) => readImage(item.image))).then((imageList) => {
      let windowList = list.map((item, index) => {
        return {
          ownerName: item.ownerName,
          name: item.name,
          windowId: item.windowId,
          image: imageList[index],
        }
      })
      this.setState({
        showScreenPicker: true,
        windowList: windowList,
      })
    })
  }

  handleDisplaySharing = (e) => {
    // getWindowInfo and open Modal
    let rtcEngine = this.getRtcEngine()
    let list = rtcEngine.getScreenDisplaysInfo()
    Promise.all(list.map((item) => readImage(item.image))).then((imageList) => {
      let displayList = list.map((item, index) => {
        let name = `Display ${index + 1}`
        return {
          ownerName: '',
          name: name,
          displayId: item.displayId,
          image: imageList[index],
        }
      })
      this.setState({
        showDisplayPicker: true,
        displayList: displayList,
      })
    })
  }

  handleRelease = () => {
    this.setState({
      isShowLocalVideoSource: '',
      users: [],
      localSharing: false,
      local: '',
    })
    if (this.rtcEngine) {
      this.rtcEngine.release()
      this.rtcEngine = null
    }
  }

  handleRtmp = () => {
    const url = RTMP_URL
    if (!url) {
      alert('RTMP URL Empty')
      return
    }
    if (!this.state.rtmpTestOn) {
      let ret = this.rtcEngine.setLiveTranscoding({
        /** width of canvas */
        width: 480,
        /** height of canvas */
        height: 640,
        /** kbps value, for 1-1 mapping pls look at https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/cpp/structagora_1_1rtc_1_1_video_encoder_configuration.html */
        videoBitrate: 500,
        /** fps, default 15 */
        // 2.9.0.107
        videoFramerate: 15,
        //3.2.1.71
        // videoFrameRate: 15,
        /** true for low latency, no video quality garanteed; false - high latency, video quality garanteed */
        lowLatency: true,
        /** Video GOP in frames, default 30 */
        videoGop: 30,
        videoCodecProfile: 77,
        /**
         * RGB hex value. Value only, do not include a #. For example, 0xC0C0C0.
         * number color = (A & 0xff) << 24 | (R & 0xff) << 16 | (G & 0xff) << 8 | (B & 0xff)
         */
        backgroundColor: 0xc0c0c0,
        /** The number of users in the live broadcast */
        userCount: 1,
        //3.2.1.71
        // audioSampleRate: 48000,
        //2.9.0.107
        audioSampleRateType: 48000,
        audioChannels: 1,
        audioBitrate: 48,
        transcodingExtraInfo: '',
        /** transcodingusers array */
        transcodingUsers: [
          {
            uid: LOCAL_USER_ID,
            x: 0,
            y: 320,
            width: 240,
            height: 320,
            zOrder: 2,
            alpha: 1.0,
            audioChannel: 1,
          },
        ],
        watermark: {
          url: 'https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png',
          x: 0,
          y: 0,
          width: 50,
          height: 50,
        },
        background: {
          url: 'https://winaero.com/blog/wp-content/uploads/2019/11/Photos-new-icon.png',
          x: 0,
          y: 0,
          width: 50,
          height: 50,
        },
      })
      console.log(`setLiveTranscoding ${ret}`)
      this.rtcEngine.addPublishStreamUrl(url, true)
    } else {
      this.rtcEngine.removePublishStreamUrl(url)
    }

    this.setState({
      rtmpTestOn: !this.state.rtmpTestOn,
    })
  }

  handleScreenPicker = (windowId) => {
    this.setState({
      showScreenPicker: false,
      localSharing: true,
    })
    this.startScreenShare(windowId)
    this.setState({
      isShowLocalVideoSource: true,
    })
  }

  handleDisplayPicker = (displayId) => {
    this.setState({
      showDisplayPicker: false,
      localSharing: true,
    })
    this.sharingPrepared = true
    this.startScreenShareByDisplay(displayId)
    this.setState({
      isShowLocalVideoSource: true,
    })
  }

  stopSharing = () => {
    let rtcEngine = this.getRtcEngine()
    rtcEngine.stopScreenCapture()
    this.setState({
      localSharing: false,
      isShowLocalVideoSource: false,
    })
  }

  togglePlaybackTest = (e) => {
    let rtcEngine = this.getRtcEngine()
    if (!this.state.playbackTestOn) {
      let filepath =
        '/Users/menthays/Projects/Agora-RTC-SDK-for-Electron/example/temp/music.mp3'
      let result = rtcEngine.startAudioPlaybackDeviceTest(filepath)
      console.log(result)
    } else {
      rtcEngine.stopAudioPlaybackDeviceTest()
    }
    this.setState({
      playbackTestOn: !this.state.playbackTestOn,
    })
  }

  toggleRecordingTest = (e) => {
    let rtcEngine = this.getRtcEngine()
    if (!this.state.recordingTestOn) {
      let result = rtcEngine.startAudioRecordingDeviceTest(1000)
      console.log(result)
    } else {
      rtcEngine.stopAudioRecordingDeviceTest()
    }
    this.setState({
      recordingTestOn: !this.state.recordingTestOn,
    })
  }

  toggleLastmileTest = (e) => {
    let rtcEngine = this.getRtcEngine()
    if (!this.state.lastmileTestOn) {
      let result = rtcEngine.startLastmileProbeTest({
        probeUplink: true,
        probeDownlink: true,
        expectedDownlinkBitrate: 500,
        expectedUplinkBitrate: 500,
      })
      console.log(result)
    } else {
      rtcEngine.stopLastmileProbeTest()
    }
    this.setState({
      lastmileTestOn: !this.state.lastmileTestOn,
    })
  }

  render() {
    let windowPicker, displayPicker
    if (this.state.showScreenPicker) {
      windowPicker = (
        <WindowPicker
          onSubmit={this.handleScreenPicker}
          onCancel={(e) => this.setState({ showScreenPicker: false })}
          windowList={this.state.windowList}
        />
      )
    }

    if (this.state.showDisplayPicker) {
      displayPicker = (
        <DisplayPicker
          onSubmit={this.handleDisplayPicker}
          onCancel={(e) => this.setState({ showScreenPicker: false })}
          displayList={this.state.displayList}
        />
      )
    }

    return (
      <div
        className='columns'
        style={{ padding: '20px', height: '100%', margin: '0' }}
      >
        {this.state.showScreenPicker ? windowPicker : ''}
        {this.state.showDisplayPicker ? displayPicker : ''}
        <div className='column is-one-quarter' style={{ overflowY: 'auto' }}>
          <div className='field'>
            <label className='label'>App ID</label>
            <div className='control'>
              <input
                onChange={(e) =>
                  this.setState({ appid: e.currentTarget.value })
                }
                value={this.state.appid}
                className='input'
                type='text'
                placeholder='APP ID'
              />
            </div>
          </div>
          <div className='field'>
            <label className='label'>Token(Optional)</label>
            <div className='control'>
              <input
                onChange={(e) =>
                  this.setState({ token: e.currentTarget.value })
                }
                value={this.state.token}
                className='input'
                type='text'
                placeholder="Token(Leave it empty if you didn't enable it)"
              />
            </div>
          </div>
          <div className='field'>
            <label className='label'>Channel</label>
            <div className='control'>
              <input
                onChange={(e) =>
                  this.setState({ channel: e.currentTarget.value })
                }
                value={this.state.channel}
                className='input'
                type='text'
                placeholder='Input a channel name'
              />
            </div>
          </div>
          <div className='field'>
            <label className='label'>Role</label>
            <div className='control'>
              <div className='select' style={{ width: '100%' }}>
                <select
                  onChange={(e) =>
                    this.setState({ role: Number(e.currentTarget.value) })
                  }
                  value={this.state.role}
                  style={{ width: '100%' }}
                >
                  <option value={1}>Anchor</option>
                  <option value={2}>Audience</option>
                </select>
              </div>
            </div>
          </div>
          <div className='field'>
            <label className='label'>VoiceChanger</label>
            <div className='control'>
              <div className='select' style={{ width: '100%' }}>
                <select
                  onChange={this.handleVoiceChanger}
                  value={this.state.voiceChangerPreset}
                  style={{ width: '100%' }}
                >
                  {voiceChangerList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='field'>
            <label className='label'>VoiceReverbPreset</label>
            <div className='control'>
              <div className='select' style={{ width: '100%' }}>
                <select
                  onChange={this.handleVoiceReverbPreset}
                  value={this.state.voiceReverbPreset}
                  style={{ width: '100%' }}
                >
                  {voiceReverbList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='field'>
            <label className='label'>Video Encoder</label>
            <div className='control'>
              <div className='select' style={{ width: '100%' }}>
                <select
                  onChange={this.handleEncoderConfiguration}
                  value={this.state.encoderConfiguration}
                  style={{ width: '100%' }}
                >
                  {videoProfileList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='field'>
            <label className='label'>AudioProfile</label>
            <div className='control'>
              <div className='select' style={{ width: '50%' }}>
                <select
                  onChange={this.handleAudioProfile}
                  value={this.state.audioProfile}
                  style={{ width: '100%' }}
                >
                  {audioProfileList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='select' style={{ width: '50%' }}>
                <select
                  onChange={this.handleAudioScenario}
                  value={this.state.audioScenario}
                  style={{ width: '100%' }}
                >
                  {audioScenarioList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='field'>
            <label className='label'>Camera</label>
            <div className='control'>
              <div className='select' style={{ width: '100%' }}>
                <select
                  onChange={this.handleCameraChange}
                  value={this.state.camera}
                  style={{ width: '100%' }}
                >
                  {this.state.videoDevices.map((item, index) => (
                    <option key={index} value={index}>
                      {item.devicename}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='field'>
            <label className='label'>Microphone</label>
            <div className='control'>
              <div className='select' style={{ width: '100%' }}>
                <select
                  onChange={this.handleMicChange}
                  value={this.state.mic}
                  style={{ width: '100%' }}
                >
                  {this.state.audioDevices.map((item, index) => (
                    <option key={index} value={index}>
                      {item.devicename}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='field'>
            <label className='label'>Loudspeaker</label>
            <div className='control'>
              <div className='select' style={{ width: '100%' }}>
                <select
                  onChange={this.handleSpeakerChange}
                  value={this.state.speaker}
                  style={{ width: '100%' }}
                >
                  {this.state.audioPlaybackDevices.map((item, index) => (
                    <option key={index} value={index}>
                      {item.devicename}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='field is-grouped is-grouped-right'>
            <div className='control'>
              <button onClick={this.handleLeave} className='button is-link'>
                Leave
              </button>
            </div>
            <div className='control'>
              <button onClick={this.handleJoin} className='button is-link'>
                Join
              </button>
            </div>
          </div>
          <hr />
          <div className='field'>
            <label className='label'>Network Test</label>
            <div className='control'>
              <button
                onClick={this.toggleLastmileTest}
                className='button is-link'
              >
                {this.state.lastmileTestOn ? 'stop' : 'start'}
              </button>
            </div>
          </div>
          <label className='label'>Screen Share</label>
          <div
            className={
              this.state.users.filter((u) => u === 2).length > 0
                ? 'hidden field is-grouped'
                : 'field is-grouped'
            }
          >
            <div
              className={this.state.localSharing ? 'hidden control' : 'control'}
            >
              <button
                onClick={this.handleScreenSharing}
                className='button is-link'
              >
                Screen Share
              </button>
            </div>
            <div
              className={this.state.localSharing ? 'hidden control' : 'control'}
            >
              <button
                onClick={this.handleDisplaySharing}
                className='button is-link'
              >
                Display Share
              </button>
            </div>
            <div
              className={this.state.localSharing ? 'control' : 'hidden control'}
            >
              <button onClick={this.stopSharing} className='button is-link'>
                Stop Share
              </button>
            </div>
          </div>
          <div className='field'>
            <label className='label'>RTMP</label>
            <div className='control'>
              <button onClick={this.handleRtmp} className='button is-link'>
                {this.state.rtmpTestOn ? 'stop' : 'start'}
              </button>
            </div>
          </div>
          <div className='field'>
            <label className='label'>Release</label>
            <div className='control'>
              <button onClick={this.handleRelease} className='button is-link'>
                Release
              </button>
            </div>
          </div>
          <div className='field'>
            <label className='label'>Audio Playback Test</label>
            <div className='control'>
              <button
                onClick={this.togglePlaybackTest}
                className='button is-link'
              >
                {this.state.playbackTestOn ? 'stop' : 'start'}
              </button>
            </div>
          </div>
          <div className='field'>
            <label className='label'>Audio Recording Test</label>
            <div className='control'>
              <button
                onClick={this.toggleRecordingTest}
                className='button is-link'
              >
                {this.state.recordingTestOn ? 'stop' : 'start'}
              </button>
            </div>
          </div>
        </div>
        <div className='column is-three-quarters window-container'>
          {this.state.users.map((item, key) => (
            <Window
              key={item}
              uid={item}
              rtcEngine={this.rtcEngine}
              role={item === SHARE_ID ? 'remoteVideoSource' : 'remote'}
            ></Window>
          ))}
          {this.state.local ? (
            <Window
              uid={this.state.local}
              rtcEngine={this.rtcEngine}
              role='local'
            ></Window>
          ) : (
            ''
          )}
          {this.state.isShowLocalVideoSource ? (
            <Window rtcEngine={this.rtcEngine} role='localVideoSource'></Window>
          ) : (
            ''
          )}
        </div>
      </div>
    )
  }
}
