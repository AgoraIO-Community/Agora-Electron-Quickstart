import { Component } from 'react'
import AgoraRtcEngine, {
  CONTENT_MODE,
  VideoSourceType,
} from 'agora-electron-sdk'
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
    if (config.isCustomElement) {
      return
    }
    const { uid, rtcEngine, channelId, videoSourceType } = this.props

    const dom = document.querySelector(`#video-${uid}`) as HTMLElement
    console.log(
      `Window:  VideoSourceType: ${videoSourceType}, channelId:${channelId}, uid:${uid}, view: ${dom}`
    )

    rtcEngine.setView({
      videoSourceType,
      uid,
      channelId,
      view: dom,
      rendererOptions: { mirror: false, contentMode: 1 },
    })
  }

  componentWillUnmount() {
    if (config.isCustomElement) {
      return
    }
    const { uid, rtcEngine } = this.props

    const dom = document.querySelector(`#video-${uid}`) as HTMLElement

    rtcEngine.destroyRendererByView(dom)
  }

  render() {
    const { uid, channelId, videoSourceType } = this.props
    const isCustomElement = config.isCustomElement
    return isCustomElement ? (
      <agora-view
        style={{
          width: '320px',
          height: '240px',
          overflow: 'hidden',
          display: 'block',
        }}
        video-source-type={videoSourceType}
        uid={uid}
        channel-id={channelId}
        renderer-content-mode={CONTENT_MODE.FIT}
        renderer-mirror={false}
      ></agora-view>
    ) : (
      <div className={styles['window-item']}>
        <div className={styles['video-item']} id={`video-${uid}`} />
      </div>
    )
  }
}

export default Window
