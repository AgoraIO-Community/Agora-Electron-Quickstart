import JoinChannelAudio from './JoinChannelAudio';
import JoinChannelVideo from './JoinChannelVideo';

const basicRoute = [
  {
    path: '/JoinChannelVideo',
    component: JoinChannelVideo,
    title: 'JoinChannelVideo',
  },
  {
    path: '/JoinChannelAudio',
    component: JoinChannelAudio,
    title: 'JoinChannelAudio',
  },
];

export default basicRoute;
