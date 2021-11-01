import React, {Component} from 'react'
import {render} from 'react-dom'
import Logo from './components/Logo/'
import Link from './components/Link/'
import AgoraRtcEngine from 'agora-electron-sdk'
import path from 'path'
import os from 'os'

import ElectronImg from './assets/electron.png'
import ReactImg from './assets/react.png'
import WebpackImg from './assets/webpack.png'
import AgoraImg from './assets/agora.png'

const logos = [
    ElectronImg,
    ReactImg,
    WebpackImg,
    AgoraImg
]

const APPID = ""


export default class App extends Component {
    componentDidMount(){
        if(global.rtcEngine) {
            global.rtcEngine.release()
            global.rtcEngine = null
        }

        if(!APPID) {
            alert('Please provide APPID in App.jsx')
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
    }
    render() {
        const logosRender = logos.map( (logo, index) => {
            return <Logo key = {index} src = { logo } />
        })

        return (
            <div>
                {logosRender}

                <div className="hello">
                    <div className="video" id="local"></div>
                    <div className="video" id="remote"></div>
                </div>
                <div id="console"></div>
            </div>
        )
    }
}
