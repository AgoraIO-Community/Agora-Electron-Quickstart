import ScreenShare from './ScreenShare/ScreenShare';
import CameraAndScreenShare from './CameraAndScreenShare/CameraAndScreenShare';
import LoadPlugin from './LoadPlugin/LoadPlugin';
import ChannelMediaRelay from './ChannelMediaRelay/ChannelMediaRelay';
import CreateDataStream from './CreateDataStream/CreateDataStream';
import JoinMultipleChannel from './JoinMultipleChannel/JoinMultipleChannel';
import ScreenCapture from './ScreenCapture/ScreenCapture';
import AudioMixing from './AudioMixing/AudioMixing';
import SetEncryption from './SetEncryption/SetEncryption';
import SetLiveTranscoding from './SetLiveTranscoding/SetLiveTranscoding';
import VoiceChanger from './VoiceChanger/VoiceChanger';

const advanceRoute = [
  {
    path: '/ScreenShare',
    component: ScreenShare,
    title: 'ScreenShare',
  },
  {
    path: '/CameraAndScreenShare',
    component: CameraAndScreenShare,
    title: 'CameraAndScreenShare',
  },
  {
    path: '/LoadPlugin',
    component: LoadPlugin,
    title: 'LoadPlugin',
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
    path: '/ScreenCapture',
    component: ScreenCapture,
    title: 'ScreenCapture',
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
    path: '/SetLiveTranscoding',
    component: SetLiveTranscoding,
    title: 'SetLiveTranscoding',
  },
  {
    path: '/VoiceChanger',
    component: VoiceChanger,
    title: 'VoiceChanger',
  },
];

export default advanceRoute;
