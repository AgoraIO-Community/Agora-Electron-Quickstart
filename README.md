# Agora Electron Quickstart

## Introduction
A **very** simple quickstart boilerplate for using [Agora-RTC-SDK-for-Electron](https://github.com/AgoraIO-Community/Agora-RTC-SDK-for-Electron). Building with [React](https://github.com/facebook/react)  and [electron-webpack](https://github.com/electron-userland/electron-webpack).


## How to build

First, create a developer account at [Agora.io](https://dashboard.agora.io/), and obtain an App ID.
Update 'settings.js' under './src/utils'.

``` bash
# install dependencies
npm install 
# enable dynamic compiling and HMR developing enviroment
npm run dev
# build for release
npm run dist
```

## Tips
When you run `npm install`, node-gyp building for `agora-electron-sdk` will be triggered. So you must provide a node-gyp build env. visit [node-gyp](https://github.com/nodejs/node-gyp/blob/master/README.md) for help.