# Agora-Electron-API-Example

_Read this in other languages: [English](README.md)_

## 简介

这个开源示例项目演示了不同场景下，Agora SDK 的基本集成逻辑。 项目中每个 Scene 都是一个独立的场景，都可以成功独立运行。

在这个示例项目中包含的所有场景都可以独立运行：

## Project structure

- **基础案例:**

| Demo                                                                                                                                                              | Description                                        | APIs                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [JoinChannelAudio](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/tree/master/Agora-Electron-API-Example/src/examples/basic/JoinChannelAudio.tsx) | basic demo to show audio call                      | getAudioRecordingDevices, ,adjustLoopbackRecordingSignalVolume, adjustRecordingSignalVolume, adjustAudioMixingPlayoutVolume, adjustPlaybackSignalVolume |
| [JoinChannelVideo](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/basic/JoinChannelVideo.tsx) | video demo with role selection in Editor Inspector | enableVideo, getVideoDevices,setChannelProfile, setClientRole, setAudioProfile, setVideoEncoderConfiguration                                            |

- **进阶案例:**

| Demo                                                                                                                                                                                           | Description                                                    | APIs                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [ScreenShare](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/ScreenShare/ScreenShare.tsx)                         | sharing application screen view from Unity camera              | getWindowInfoList, getScreenInfoList, videoSourceSetVideoProfile, videoSourceStartScreenCaptureByScreen, startScreenCapturePreview, videoSourceStartScreenCaptureByWindow, stopScreenCapture2 , videoSourceLeave, videoSourceRelease |
| [LoadPlugin](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/LoadPlugin/LoadPlugin.tsx)                                       | Load the cpp plug-in to process audio and video data           | initializePluginManager, enablePlugin, getPlugins                                                                                                                                                                                    |
| [ChannelMediaRelay](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/ChannelMediaRelay/ChannelMediaRelay.tsx)                         | audioMixing and play audio effect in the channel               | startChannelMediaRelay, stopChannelMediaRelay                                                                                                                                                                                        |
| [CreateDataStream](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/CreateDataStream/CreateDataStream.tsx)          | use AudioSource to play raw data received in the Agora channel | createDataStreamWithConfig, sendStreamMessage                                                                                                                                                                                        |
| [JoinMultipleChannel](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/JoinMultipleChannel/JoinMultipleChannel.tsx) | Sending raw data from AudioSource into the Agora channel       | createChannel                                                                                                                                                                                                                        |

## 如何运行示例程序

#### 运行环境

- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/) package manager

#### 运行步骤

- 首先在 [Agora.io 注册](https://dashboard.agora.io/cn/signup/) 注册账号，并创建自己的测试项目，获取到 AppID。

然后进行以下操作:

```shell
$ git clone https://github.com/AgoraIO-Community/Agora-Electron-Quickstart
$ cd Agora-Electron-API-Example
$ yarn
$ yarn start

```

## 反馈

如果您对示例项目有任何问题或建议，请随时提交问题。

## 参考文档

- 您可以在 [文档中心](https://docs.agora.io/cn/Video/API%20Reference/electron/index.html)找到完整的 API 文档

## 相关资源

- 你可以先参阅[常见问题](https://docs.agora.io/cn/faq)
- 如果你想了解更多官方示例，可以参考[官方 SDK 示例](https://github.com/AgoraIO)
- 如果你想了解声网 SDK 在复杂场景下的应用，可以参考[官方场景案例](https://github.com/AgoraIO-usecase)
- 如果你想了解声网的一些社区开发者维护的项目，可以查看[社区](https://github.com/AgoraIO-Community)
- 若遇到问题需要开发者帮助，你可以到[开发者社区](https://rtcdeveloper.com/)提问
- 如果需要售后技术支持, 你可以在[Agora Dashboard](https://dashboard.agora.io/)提交工单

## 代码许可

示例项目遵守 MIT 许可证。
