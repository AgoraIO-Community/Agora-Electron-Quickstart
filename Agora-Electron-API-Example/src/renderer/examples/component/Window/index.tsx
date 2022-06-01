import { Component } from 'react'
import AgoraRtcEngine, { VideoSourceType } from 'agora-electron-sdk'
import styles from './index.scss'
import config from '../../config/agora.config'

interface WindowProps {
  rtcEngine: AgoraRtcEngine
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

    rtcEngine.setupVideo({
      videoSourceType,
      uid,
      channelId,
      view: dom,
      rendererOptions: { mirror: false, contentMode: 1 },
    })
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
