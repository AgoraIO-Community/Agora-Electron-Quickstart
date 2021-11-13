# Agora-Electron-API-Example

_**其他语言版本：** [**简体中文**](README.zh.md)_

## Overview

The Agora-Electron-API-Example project is an open-source demo that will show you different scenes on how to integrate Agora SDK APIs into your project.

Any scene of this project can run successfully alone.

## Project structure

- **Basic demos:**

| Demo                                                                                                                                                              | Description                                        | APIs                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [JoinChannelAudio](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/tree/master/Agora-Electron-API-Example/src/examples/basic/JoinChannelAudio.tsx) | basic demo to show audio call                      | getAudioRecordingDevices, ,adjustLoopbackRecordingSignalVolume, adjustRecordingSignalVolume, adjustAudioMixingPlayoutVolume, adjustPlaybackSignalVolume |
| [JoinChannelVideo](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/basic/JoinChannelVideo.tsx) | video demo with role selection in Editor Inspector | enableVideo, getVideoDevices,setChannelProfile, setClientRole, setAudioProfile, setVideoEncoderConfiguration                                            |

- **Advanced demos:**

| Demo                                                                                                                                                                                           | Description                                                    | APIs                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [ScreenShare](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/ScreenShare/ScreenShare.tsx)                         | sharing application screen view from Unity camera              | getWindowInfoList, getScreenInfoList, videoSourceSetVideoProfile, videoSourceStartScreenCaptureByScreen, startScreenCapturePreview, videoSourceStartScreenCaptureByWindow, stopScreenCapture2 , videoSourceLeave, videoSourceRelease |
| [LoadPlugin](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/LoadPlugin/LoadPlugin.tsx)                                       | Load the cpp plug-in to process audio and video data           | initializePluginManager, enablePlugin, getPlugins                                                                                                                                                                                    |
| [ChannelMediaRelay](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/ChannelMediaRelay/ChannelMediaRelay.tsx)                         | audioMixing and play audio effect in the channel               | startChannelMediaRelay, stopChannelMediaRelay                                                                                                                                                                                        |
| [CreateDataStream](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/CreateDataStream/CreateDataStream.tsx)          | use AudioSource to play raw data received in the Agora channel | createDataStreamWithConfig, sendStreamMessage                                                                                                                                                                                        |
| [JoinMultipleChannel](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/blob/master/Agora-Electron-API-Example/src/examples/advanced/JoinMultipleChannel/JoinMultipleChannel.tsx) | Sending raw data from AudioSource into the Agora channel       | createChannel                                                                                                                                                                                                                        |

## How to run the sample project

#### Developer Environment Requirements

- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/) 6.9.1+ with C++11 support
- [Yarn](https://yarnpkg.com/)  package manager

#### Steps to run

First, create a developer account at [Agora.io](https://dashboard.agora.io/signin/), and obtain an App ID.

Then do the following:

```shell 
$ git clone https://github.com/AgoraIO-Community/Agora-Electron-Quickstart
$ cd Agora-Electron-API-Example
$ yarn
$ yarn start

```

## Feedback

If you have any problems or suggestions regarding the sample projects, feel free to file an issue.

## Reference

- You can find full API document at [Document Center](https://docs.agora.io/en/Video/API%20Reference/electron/index.html)
- You can file issues about this demo at [issue](https://github.com/AgoraIO/Electron-SDK/issues)

## Related resources

- Check our [FAQ](https://docs.agora.io/en/faq) to see if your issue has been recorded.
- Dive into [Agora SDK Samples](https://github.com/AgoraIO) to see more tutorials
- Take a look at [Agora Use Case](https://github.com/AgoraIO-usecase) for more complicated real use case
- Repositories managed by developer communities can be found at [Agora Community](https://github.com/AgoraIO-Community)
- If you encounter problems during integration, feel free to ask questions in [Stack Overflow](https://stackoverflow.com/questions/tagged/agora.io)

## License

The sample projects are under the MIT license.
