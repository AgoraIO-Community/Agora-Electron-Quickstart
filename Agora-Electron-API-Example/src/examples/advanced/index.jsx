import ScreenShare from './ScreenShare/ScreenShare';
import ControlAudioOnSubProcess from './AudioChildProcess';
import LoadCppPlugin from './LoadCppPlugin';

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
    path: '/LoadCppPlugin',
    component: LoadCppPlugin,
    title: 'LoadCppPlugin',
  },
];

export default advanceRoute;
