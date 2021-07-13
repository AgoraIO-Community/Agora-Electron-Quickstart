import React, { useState } from 'react';
import { Button } from 'antd';
import JoinChannelAudio from './JoinChannelAudio';
import JoinChannelVideo from './JoinChannelVideo';
import ScreenShare from './ScreenShare';

const basicRoutes = [
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
  {
    path: '/ScreenShare',
    component: ScreenShare,
    title: 'ScreenShare',
  },
];

export default basicRoutes;
