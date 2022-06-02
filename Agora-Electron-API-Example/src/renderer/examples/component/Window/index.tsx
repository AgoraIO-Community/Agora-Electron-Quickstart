import {
  IRtcEngine,
  IRtcEngineEx,
  RenderModeType,
  RtcEngineExImplInternal,
  VideoMirrorModeType,
  VideoSourceType,
} from 'agora-electron-sdk'
import { Component } from 'react'
import styles from './index.scss'

interface WindowProps {
  rtcEngine: IRtcEngineEx & IRtcEngine & RtcEngineExImplInternal
  uid?: number
  videoSourceType: VideoSourceType
  channelId?: string
}
class Window extends Component<WindowProps> {
  componentDidMount() {
    const { uid, rtcEngine, channelId, videoSourceType } = this.props

    const dom = document.querySelector(`#video-${uid}`) as HTMLElement
    console.log(
      `Window:  VideoSourceType: ${videoSourceType}, channelId:${channelId}, uid:${uid}, view: ${dom}`
    )
    if (videoSourceType === VideoSourceType.VideoSourceRemote) {
      rtcEngine.setupRemoteVideoEx(
        {
          sourceType: videoSourceType,
          uid,
          view: dom,
          mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
          renderMode: RenderModeType.RenderModeFit,
        },
        { channelId }
      )
    } else {
      rtcEngine.setupLocalVideo({
        sourceType: videoSourceType,
        uid,
        view: dom,
        mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
        renderMode: RenderModeType.RenderModeFit,
      })
    }
  }

  componentWillUnmount() {
    const { uid, rtcEngine } = this.props

    const dom = document.querySelector(`#video-${uid}`) as HTMLElement

    rtcEngine.destroyRendererByView(dom)
  }

  render() {
    const { uid } = this.props
    return (
      <div className={styles['window-item']}>
        <div className={styles['video-item']} id={`video-${uid}`} />
      </div>
    )
  }
}

export default Window
