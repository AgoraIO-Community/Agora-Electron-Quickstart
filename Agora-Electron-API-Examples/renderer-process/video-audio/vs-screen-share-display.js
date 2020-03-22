(() => {
  const AgoraRtcEngine = require('agora-electron-sdk').default

  const os = require('os')
  const path = require('path')
  const consoleContainer = document.getElementById('agora-vs-screen-share-display-console')
  const sdkLogPath = path.resolve(os.homedir(), "./agoramainsdk.log")
  const localVideoContainer = document.getElementById('vs-screen-share-display-local-video')
  const localScreenContainer = document.getElementById('vs-screen-share-display-local-screen')
  const remoteVideoContainer = document.getElementById('vs-screen-share-display-remote-video')
  const APPID = global.AGORA_APPID || ""
  const channel = "demoChannel"
  
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
    consoleContainer.innerHTML = `joined channel ${channel} with uid ${uid}, elapsed ${elapsed}ms`
    //setup render area for local user
    rtcEngine.setupLocalVideo(localVideoContainer)

    //find a display
    let displays = rtcEngine.getScreenDisplaysInfo()

    if(displays.length === 0) {
      return alert('no display found')
    }

    //start video source
    rtcEngine.videoSourceInitialize(APPID)
    rtcEngine.videoSourceSetChannelProfile(1);
    rtcEngine.videoSourceJoin(null, channel, "", 1)
    rtcEngine.on('videosourcejoinedsuccess', () => {

      // start screenshare
      rtcEngine.videoSourceSetVideoProfile(43, false);
      rtcEngine.videoSourceStartScreenCaptureByScreen(displays[0].displayId, {
        x: 0, y: 0, width: 0, height: 0
      }, {
        width: 0, height: 0, frameRate: 5, bitrate: 0
      })
      //setup dom where to display screenshare preview
      rtcEngine.setupLocalVideoSource(localScreenContainer)
      rtcEngine.startScreenCapturePreview()
    })
  })
  rtcEngine.on('error', (err, msg) => {
    consoleContainer.innerHTML = `error: code ${err} - ${msg}`
  })
  rtcEngine.on('userJoined', (uid) => {
    //setup render area for joined user
    rtcEngine.setupViewContentMode(uid, 1);
    rtcEngine.subscribe(uid, remoteVideoContainer)
  })
  
  // set channel profile, 0: video call, 1: live broadcasting
  rtcEngine.setChannelProfile(1)
  rtcEngine.setClientRole(1)
  
  // enable video, call disableVideo() is you don't need video at all
  rtcEngine.enableVideo()
  
  // set where log file should be put for problem diagnostic
  rtcEngine.setLogFile(sdkLogPath)
  
  // join channel to rock!
  rtcEngine.joinChannel(null, channel, null, Math.floor(new Date().getTime() / 1000))
  
  global.rtcEngine = rtcEngine  
})()