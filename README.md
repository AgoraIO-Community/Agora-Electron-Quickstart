# Agora Electron Quickstart

This tutorial describes how to create an Agora account and build a sample app with Agora using [Electron](https://electronjs.org/) and [React](https://github.com/facebook/react).

## Prerequisites
- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/) 6.9.1+ with C++11 support
- [Electron](https://electronjs.org) >= 1.8.3

## Quick Start
This section shows you how to prepare and build the Agora Electron wrapper.

### Create an Account and Obtain an App ID
To build and run the sample application, first obtain an app ID: 

1. Create a developer account at [agora.io](https://dashboard.agora.io/signin/). Once you finish the sign-up process, you are redirected to the dashboard.
2. Navigate in the dashboard tree on the left to **Projects** > **Project List**.
3. Copy the app ID that you obtain from the dashboard into a text file. You will use this when you launch the app.

### Update and Run the Sample Application

Open the [settings.js](src/utils/settings.js) file and add the app ID.

Run the `install` command in your project directory:

```bash  
  # install dependencies
  npm install 
```

**Note:** During install, the C++ add-on is downloaded instead of being built.


Use the `run dev` or `run dist` command to build the Agora Electron wrapper.
To enable dynamic compiling and HMR development, use `run dev`:
	
```bash
# enable dynamic compiling and HMR developing environment
npm run dev
```

To build for release, use `run dist`:

```bash
# build for release
npm run dist
```

Once the build is complete, use the resulting Agora Electron wrapper to build your application.

## Resources
* [Documention](https://docs.agora.io/en/Video/API%20Reference/electron/index.html)
* [File bugs about this sample](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/issues)
* Full Electron SDK wrapper addon source can be found at [Agora RTC SDK for Electron](https://github.com/AgoraIO-Community/Agora-RTC-SDK-for-Electron)
* General information about building apps with [React](https://github.com/facebook/react) and the [Electron Webpack](https://github.com/electron-userland/electron-webpack)


## License
This software is under the MIT License (MIT). [View the license](LICENSE.md).
