import AudioMixing from './AudioMixing/AudioMixing'
import ChannelMediaRelay from './ChannelMediaRelay/ChannelMediaRelay'
import CreateDataStream from './CreateDataStream/CreateDataStream'
import JoinMultipleChannel from './JoinMultipleChannel/JoinMultipleChannel'
import MediaPlayer from './MediaPlayer/MediaPlayer'
import ScreenShare from './ScreenShare/ScreenShare'
import SetEncryption from './SetEncryption/SetEncryption'
import SetLiveTranscoding from './SetLiveTranscoding/SetLiveTranscoding'
import SpatialAudio from './SpatialAudio/SpatialAudio'
import TakeSnapshot from './TakeSnapshot/TakeSnapshot'
import VirtualBackground from './VirtualBackground/VirtualBackground'
import VoiceChanger from './VoiceChanger/VoiceChanger'

const advanceRoute = [
  {
    path: '/SpatialAudio',
    component: SpatialAudio,
    title: 'SpatialAudio',
  },
  {
    path: '/VirtualBackground',
    component: VirtualBackground,
    title: 'VirtualBackground',
  },
  {
    path: '/TakeSnapshot',
    component: TakeSnapshot,
    title: 'TakeSnapshot',
  },
  {
    path: '/ScreenShare',
    component: ScreenShare,
    title: 'ScreenShare',
  },
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
  {
    path: '/MediaPlayer',
    component: MediaPlayer,
    title: 'MediaPlayer',
  },
]

export default advanceRoute
