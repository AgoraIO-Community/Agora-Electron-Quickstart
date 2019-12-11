(() => {
  const AgoraRtcEngine = require('agora-electron-sdk').default

  const os = require('os')
  const path = require('path')
  const consoleContainer = document.getElementById('agora-join-channel-console')
  const sdkLogPath = path.resolve(os.homedir(), "./agoramainsdk.log")
  const localVideoContainer = document.getElementById('join-channel-local-video')
  const remoteVideoContainer = document.getElementById('join-channel-remote-video')
  const APPID = global.AGORA_APPID || ""
  
  if(!APPID) {
    alert(`AGORA_APPID not found in environment variables`)
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
  rtcEngine.joinChannel(null, "demoChannel", null, Math.floor(new Date().getTime() / 1000))
  
  global.rtcEngine = rtcEngine  
})()