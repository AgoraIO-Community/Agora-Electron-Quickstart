# Agora Electron Quickstart

This tutorial describes how to create an Agora account and build a sample app with Agora using [Electron](https://electronjs.org/) and [React](https://github.com/facebook/react).

## Prerequisites
- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/) 6.9.1+ with C++11 support
- [Electron](https://electronjs.org) = \[1.8.3, 3.0.6, 4.2.8, 5.0.8, 6.1.5, 7.1.2, 9.0.0, 10.0.0, 11.2.0, 11.0.0, 12.0.0]

## Quick Start
This section shows you how to prepare and build the Agora Electron wrapper.

### Create an Account and Obtain an App ID
To build and run the sample application, first obtain an app ID: 

1. Create a developer account at [agora.io](https://dashboard.agora.io/signin/). Once you finish the sign-up process, you are redirected to the dashboard.
2. Navigate in the dashboard tree on the left to **Projects** > **Project List**.
3. Copy the app ID that you obtain from the dashboard into a text file. You will use this when you launch the app.

### Update and Run the Sample Application

Open the [agora.config.js](src/agora.config.js) file and add the app ID.

Run the `install` command in your project directory:

```bash  
  # install dependencies
  npm install 
```

**Note:** During install, the C++ add-on is downloaded instead of being built.

Use the `run start` command to build the Agora Electron wrapper.
	
```bash
# enable dynamic compiling and HMR developing environment
npm run start
```

## Resources
* [Documentation](https://docs.agora.io/en/Video/API%20Reference/electron/index.html)
* [File bugs about this sample](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/issues)
* Full Electron SDK wrapper addon source can be found at [Agora RTC SDK for Electron](https://github.com/AgoraIO-Community/Agora-RTC-SDK-for-Electron)

## License
This software is under the MIT License (MIT). [View the license](LICENSE.md).
