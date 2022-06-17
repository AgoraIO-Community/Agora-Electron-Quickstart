import AudioMixing from './AudioMixing/AudioMixing';
import BeautyEffect from './BeautyEffect/BeautyEffect';
import CameraAndScreenShare from './CameraAndScreenShare/CameraAndScreenShare';
import ChannelMediaRelay from './ChannelMediaRelay/ChannelMediaRelay';
import CreateDataStream from './CreateDataStream/CreateDataStream';
import JoinMultipleChannel from './JoinMultipleChannel/JoinMultipleChannel';
import LoadPlugin from './LoadPlugin/LoadPlugin';
import ScreenCapture from './ScreenCapture/ScreenCapture';
import ScreenShare from './ScreenShare/ScreenShare';
import SetEncryption from './SetEncryption/SetEncryption';
import SetLiveTranscoding from './SetLiveTranscoding/SetLiveTranscoding';
import VirtualBackground from './VirtualBackground/VirtualBackground';
import VoiceChanger from './VoiceChanger/VoiceChanger';

const advanceRoute = [
  { path: '/AudioMixing', component: AudioMixing, title: 'AudioMixing' },
  { path: '/BeautyEffect', component: BeautyEffect, title: 'BeautyEffect' },
  {
    path: '/CameraAndScreenShare',
    component: CameraAndScreenShare,
    title: 'CameraAndScreenShare',
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
  { path: '/LoadPlugin', component: LoadPlugin, title: 'LoadPlugin' },
  { path: '/ScreenCapture', component: ScreenCapture, title: 'ScreenCapture' },
  { path: '/ScreenShare', component: ScreenShare, title: 'ScreenShare' },
  { path: '/SetEncryption', component: SetEncryption, title: 'SetEncryption' },
  {
    path: '/SetLiveTranscoding',
    component: SetLiveTranscoding,
    title: 'SetLiveTranscoding',
  },
  {
    path: '/VirtualBackground',
    component: VirtualBackground,
    title: 'VirtualBackground',
  },
  { path: '/VoiceChanger', component: VoiceChanger, title: 'VoiceChanger' },
];

export default advanceRoute;
