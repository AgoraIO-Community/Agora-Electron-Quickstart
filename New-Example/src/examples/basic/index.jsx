import React, { useState } from 'react';
import { Button } from 'antd';
import JoinChannelAudio from './JoinChannelAudio';
import AudioChildProcess from './AudioChildProcess';
import ScreenShare from './ScreenShare';

const basicRoutes = [
  // {
  //   path: '/JoinChannelVideo',
  //   component: JoinChannelVideo,
  //   title: 'JoinChannelVideo',
  // },
  {
    path: '/JoinChannelAudio',
    component: JoinChannelAudio,
    title: 'Audio',
  },
  {
    path: '/AudioChildProcess',
    component: AudioChildProcess,
    title: 'Audio(Child Process)',
  },
  {
    path: '/ScreenShare',
    component: ScreenShare,
    title: 'ScreenShare',
  },
];

export default basicRoutes;
