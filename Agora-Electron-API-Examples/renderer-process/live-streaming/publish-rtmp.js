(() => {
  const AgoraRtcEngine = require('agora-electron-sdk').default
  const os = require('os')
  const path = require('path')
  const consoleContainer = document.getElementById(`agora-rtmp-streaming-console`)
  const sdkLogPath = path.resolve(os.homedir(), "./agoramainsdk.log")
  const localVideoContainer = document.getElementById(`rtmp-streaming-local-video`)
  const APPID = global.AGORA_APPID || ""
  const RTMP_URL = global.RTMP_URL || ""
  
  if(!APPID) {
    alert(`AGORA_APPID not found in environment variables`)
    return
  }
  
  if(global.rtcEngine) {
    // if rtc engine exists already, you must call release to free it first
    global.rtcEngine.release()
  }
  
  let rtcEngine = new AgoraRtcEngine()
  rtcEngine.initialize(APPID)
  
  // listen to events
  rtcEngine.on('joinedChannel', (channel, uid, elapsed) => {
    //called when join channel success
    consoleContainer.innerHTML = `joined channel ${channel} with uid ${uid}, elapsed ${elapsed}ms`
    //setup render area for local user
    rtcEngine.setupLocalVideo(localVideoContainer)

    //prepare rtmp streaming state listener
    rtcEngine.on('rtmpStreamingStateChanged', (url, state, code) => {
      consoleContainer.innerHTML = (`rtmpStreamingStateChanged ${url} ${state} ${code}`)
    })

    //start live RTMP streaming after join
    rtcEngine.setLiveTranscoding({
      /** width of canvas */
      width: 640,
      /** height of canvas */
      height: 480,
      /** kbps value, for 1-1 mapping pls look at https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/cpp/structagora_1_1rtc_1_1_video_encoder_configuration.html */
      videoBitrate: 500,
      /** fps, default 15 */
      videoFrameRate: 15,
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
      audioSampleRate: 1,
      audioChannels: 1,
      audioBitrate: 48,
      /** transcodingusers array */
      transcodingUsers: [
        {
          uid: uid,
          x: 0,
          y: 0,
          width: 320,
          height: 240,
          zOrder: 1,
          alpha: 1,
          audioChannel: 1
        }
      ],
      watermark: {
        url: "",
        x: 0,
        y:0,
        width: 0,
        height: 0
      }
    });
    rtcEngine.addPublishStreamUrl(
      RTMP_URL,
      true
    );
  })
  rtcEngine.on('error', (err, msg) => {
    consoleContainer.innerHTML = `error: code ${err} - ${msg}`
  })
  rtcEngine.on('userJoined', (uid) => {
    //setup render area for joined user
    //we don't demonstrate remote stream here, so we will mute remote video stream receiving
    rtcEngine.muteRemoteVideoStream(uid, true)
  })
  
  // set channel profile, 0: video call, 1: live broadcasting
  rtcEngine.setChannelProfile(1)
  rtcEngine.setClientRole(1)
  
  // enable video, call disableVideo() is you don't need video at all
  rtcEngine.enableVideo()
  
  // set where log file should be put for problem diagnostic
  rtcEngine.setLogFile(sdkLogPath)
  
  // join channel to rock!
  rtcEngine.joinChannel(null, "demoChannel", null, Math.floor(new Date().getTime() / 1000))
  
  global.rtcEngine = rtcEngine  
})()