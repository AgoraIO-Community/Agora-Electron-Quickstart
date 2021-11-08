import ScreenShare from './ScreenShare/ScreenShare';
import ControlAudioOnSubProcess from './AudioChildProcess';
import LoadPlugin from './LoadPlugin';
import ChannelMediaRelay from './ChannelMediaRelay';

const advanceRoute = [
  {
    path: '/ScreenShare',
    component: ScreenShare,
    title: 'ScreenShare',
  },
  {
    path: '/ControlAudioOnSubProcess',
    component: ControlAudioOnSubProcess,
    title: 'ControlAudioOnSubProcess',
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
];

export default advanceRoute;
