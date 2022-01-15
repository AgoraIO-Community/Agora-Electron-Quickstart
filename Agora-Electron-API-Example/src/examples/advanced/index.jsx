import ScreenShare from './ScreenShare/ScreenShare';
import LoadPlugin from './LoadPlugin/LoadPlugin';
import ChannelMediaRelay from './ChannelMediaRelay/ChannelMediaRelay';
import CreateDataStream from './CreateDataStream/CreateDataStream';
import JoinMultipleChannel from './JoinMultipleChannel/JoinMultipleChannel';
import ScreenCapture from './ScreenCapture/ScreenCapture';

const advanceRoute = [
  {
    path: '/ScreenShare',
    component: ScreenShare,
    title: 'ScreenShare',
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
  
];

export default advanceRoute;