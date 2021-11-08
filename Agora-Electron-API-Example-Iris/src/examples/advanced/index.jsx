import ScreenShare from './ScreenShare/ScreenShare';
import JoinMultipleChannel from './JoinMultipleChannel/JoinMultipleChannel';

const advanceRoute = [
  {
    path: '/ScreenShare',
    component: ScreenShare,
    title: 'ScreenShare',
  },
  {
    path: '/JoinMultipleChannel',
    component: JoinMultipleChannel,
    title: 'JoinMultipleChannel',
  },
];

export default advanceRoute;
