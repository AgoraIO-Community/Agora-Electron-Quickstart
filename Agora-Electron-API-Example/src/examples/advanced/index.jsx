import ScreenShare from './ScreenShare/ScreenShare';
import ControlAudioOnSubProcess from './AudioChildProcess';
import LoadPlugin from './LoadPlugin';
import ChannelMediaRelay from './ChannelMediaRelay';
import CreateDataStream from './CreateDataStream/CreateDataStream';
import JoinMultipleChannel from './JoinMultipleChannel/JoinMultipleChannel';

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
];

export default advanceRoute;
