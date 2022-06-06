// import ScreenShare from './ScreenShare/ScreenShare'
import CreateDataStream from './CreateDataStream/CreateDataStream'
import JoinMultipleChannel from './JoinMultipleChannel/JoinMultipleChannel'
import AudioMixing from './AudioMixing/AudioMixing'
import ChannelMediaRelay from './ChannelMediaRelay/ChannelMediaRelay'
import SetEncryption from './SetEncryption/SetEncryption'
import VoiceChanger from './VoiceChanger/VoiceChanger'
import SetLiveTranscoding from './SetLiveTranscoding/SetLiveTranscoding'

const advanceRoute = [
  // {
  //   path: '/ScreenShare',
  //   component: ScreenShare,
  //   title: 'ScreenShare',
  // },
  {
    path: '/ChannelMediaRelay',
    component: ChannelMediaRelay,
    title: 'ChannelMediaRelay',
  },
  {
    path: '/CreateDataStream',
    component: CreateDataStream,
    title: 'CreateDataStream',
  },
  {
    path: '/JoinMultipleChannel',
    component: JoinMultipleChannel,
    title: 'JoinMultipleChannel',
  },
  {
    path: '/AudioMixing',
    component: AudioMixing,
    title: 'AudioMixing',
  },
  {
    path: '/SetEncryption',
    component: SetEncryption,
    title: 'SetEncryption',
  },
  {
    path: '/VoiceChanger',
    component: VoiceChanger,
    title: 'VoiceChanger',
  },
  {
    path: '/SetLiveTranscoding',
    component: SetLiveTranscoding,
    title: 'SetLiveTranscoding',
  },
]

export default advanceRoute
