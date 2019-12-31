<template>
    <div id='app'>
        <img class='logo' src='./assets/electron.png' />
        <img class='logo' src='./assets/vue.png' />
        <img class='logo' src='./assets/webpack.png' />
        <img class='agora-logo' src='./assets/agora.png' />
        <div class="hello">
            <div class="video" id="local"></div>
            <div class="video" id="remote"></div>
        </div>
        <div id="console"></div>
    </div>
</template>

<script>
    import Hello from './components/Hello.vue'
    import AgoraRtcEngine from 'agora-electron-sdk'
    import path from 'path'
    import os from 'os'

    // With shell.openExternal(url) is how
    // external urls must be handled, not href
    const shell = require('electron').shell
    const APPID = ""

    export default {
        components: {
            Hello
        },
        methods: {
            link: (url) => {
                shell.openExternal(url)
            }
        },
        mounted: function() {
            this.$nextTick(function () {
                // Code that will run only after the
                // entire view has been rendered
                if(global.rtcEngine) {
                    global.rtcEngine.release()
                    global.rtcEngine = null
                }

                if(!APPID) {
                    alert('Please provide APPID in App.vue')
                    return
                }

                const consoleContainer = document.querySelector('#console')

                let rtcEngine = new AgoraRtcEngine()
                rtcEngine.initialize(APPID)
                
                // listen to events
                rtcEngine.on('joinedChannel', (channel, uid, elapsed) => {
                    consoleContainer.innerHTML = `join channel success ${channel} ${uid} ${elapsed}`
                    let localVideoContainer = document.querySelector('#local')
                    //setup render area for local user
                    rtcEngine.setupLocalVideo(localVideoContainer)
                })
                rtcEngine.on('error', (err, msg) => {
                consoleContainer.innerHTML = `error: code ${err} - ${msg}`
                })
                rtcEngine.on('userJoined', (uid) => {
                //setup render area for joined user
                let remoteVideoContainer = document.querySelector('#remote')
                rtcEngine.setupViewContentMode(uid, 1);
                rtcEngine.subscribe(uid, remoteVideoContainer)
                })
                
                // set channel profile, 0: video call, 1: live broadcasting
                rtcEngine.setChannelProfile(1)
                rtcEngine.setClientRole(1)
                
                // enable video, call disableVideo() is you don't need video at all
                rtcEngine.enableVideo()
                
                const logpath = path.join(os.homedir(), 'agorasdk.log')
                // set where log file should be put for problem diagnostic
                rtcEngine.setLogFile(logpath)
                
                // join channel to rock!
                rtcEngine.joinChannel(null, "demoChannel", null, Math.floor(new Date().getTime() / 1000))

                global.rtcEngine = rtcEngine
            })
        }
    }
</script>

<style>
    html {
        height: 100%;
    }
    body {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        margin: auto;
    }
    #app {
        color: #2c3e50;
        max-width: 600px;
        font-family: Source Sans Pro, Helvetica, sans-serif;
        text-align: center;
    }
    #app a {
        color: #42b983;
        text-decoration: none;
    }
    #app p {
        text-align: justify;
    }
    .logo {
        width: auto;
        height: 100px;
    }
    .agora-logo {
        height: 80px;
    }
    .hello {
        color: var(--primary-color);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .video {
        width: 120px;
        height: 120px;
        overflow: hidden;
    }
</style>
