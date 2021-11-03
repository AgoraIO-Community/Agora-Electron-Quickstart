import ScreenShare from './ScreenShare/ScreenShare';
import ControlAudioOnSubProcess from './AudioChildProcess';

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
];

export default advanceRoute;
