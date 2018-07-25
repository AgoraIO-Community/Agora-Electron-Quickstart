# Agora Electron Quickstart

This tutorial enables you to quickly get started with creating an Agora account and building a sample app with Agora using [Electron](https://electronjs.org/) and [React](https://github.com/facebook/react).

## Prerequisites
- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/) 6.9.1+ with C++11 support
- [Electron](https://electronjs.org) 1.8.3+

## Quick Start
This section shows you how to prepare and build the Agora Electron wrapper.

### Create an Account and Obtain an App ID
In order to build and run the sample application you must obtain an App ID: 

1. Create a developer account at [agora.io](https://dashboard.agora.io/signin/). Once you finish the signup process, you will be redirected to the Dashboard.
2. Navigate in the Dashboard tree on the left to **Projects** > **Project List**.
3. Copy the App ID that you obtained from the Dashboard into a text file. You will use this when you launch the app.

### Update and Run the Sample Application 

1. Open the [settings.js](src/utils/settings.js) file and add the App ID.


    **Before**

```javascript
  export const APP_ID = ''

```


    **After**
	
  The `<MY_APP_ID>` is App ID from your Agora Dashboard

```javascript
  export const APP_ID = '<MY_APP_ID>'  
```


2. Run the `install` command in your project directory.

```bash  
  # install dependencies
  npm install 
```

    **Note:** During install, the C++ add-on will be downloaded instead of being built.


3. Use the `run dev` or `run dist` command to build the Agora Electron wrapper.

	 To enable dynamic compiling and HMR development, use `run dev`.
	
```bash
# enable dynamic compiling and HMR developing enviroment
npm run dev
```

    To build for release, use `run dist`.


```bash
# build for release
npm run dist
```


4. Once the build is complete, you can use the resulting Agora Electron wrapper to build your application.


## Steps to Create the Sample

The key code for the sample application is in the [`src/renderer/index.js`](src/renderer/index.js) file:

- [Create the Default Class](#create-the-default-class)
- [Create the Window Class](#create-the-window-class)

### Add the Import Statements

Import the required libraries and helper files for the sample application:

Library|Descriptions
---|---
`React, { Component }`|Enables JSX syntax in ES6 modules
`AgoraRtcEngine`|Agora Engine SDK
`{ List }`|Enables use of the list component
`{videoProfileList, audioProfileList, audioScenarioList, APP_ID }`|Constants declared in the [settings.js](src/utils/settings.js) file

``` JavaScript
import React, { Component } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';
import { List } from 'immutable';

import {videoProfileList, audioProfileList, audioScenarioList, APP_ID } from '../utils/settings'
```

### Create the Default Class

The default class for the application extends `Component` and is named `App`.

The remaining code in this section are contained within the `class` declaration.

``` JavaScript
export default class App extends Component {
  
  ...
  
}
```

- [Build the Constructor](#build-the-constructor)
- [Add Functionality to componentDidMount](#add-functionality-to-componentdidmount)
- [Create the subscribeEvents Method](#create-the-subscribeevents-method)
- [Create the handleJoin Method](#create-the-handlejoin-method)
- [Create the handleCameraChange Method](#create-the-handlecamerachange-method)
- [Create the handleMicChange Method](#create-the-handlemicchange-method)
- [Create the handleSpeakerChange Method](#create-the-handlespeakerchange-method)
- [Create the handleVideoProfile Method](#create-the-handlevideoprofile-method)
- [Render the View](#render-the-view)


#### Build the Constructor

The `constructor()` method passes in the properties parameter `props`. This method called before the view is mounted. Invoke `super(props)` first, to ensure `this.props` is defined for the class.

Initialize the Agora engine `this.rtcEngine` using `new AgoraRtcEngine()`.

The remaining code in this section is contained within the `constructor()` method.

``` JavaScript
  constructor(props) {
    super(props)

    this.rtcEngine = new AgoraRtcEngine()
    
    ...
    
  }
```

If `APP_ID` is not defined, alert the user that the App ID is missing using `alert()`.

If `APP_ID` is defined:

- Initialize the Agora RTC engine using `this.rtcEngine.initialize()`
- Set the properties for `state`

	Property|Value|Description
---|---|---
`local`|Empty string|Local user ID
`users`|`new List()`|List of joined users
`channel`|Empty string|Current channel
`role`|`1`|Current user's role
`videoDevices`|`this.rtcEngine.getVideoDevices()`|List of available video devices
`audioDevices`|`this.rtcEngine.getAudioRecordingDevices()`|List of available audio devices
`audioPlaybackDevices`|`this.rtcEngine.getAudioPlaybackDevices()`|List of audio playback devices
`camera`|`0`|Index of the selected camera
`mic`|`0`|Index of the selected microphone
`speaker`|`0`|Index of the selected speaker
`videoProfile`|`43`|Video profile identifier

``` JavaScript
    if (!APP_ID) {
      alert('APP_ID cannot be empty!')
    } else {
      this.rtcEngine.initialize(APP_ID)
      this.state = {
        local: '',
        users: new List(),
        channel: '',
        role: 1,
        videoDevices: this.rtcEngine.getVideoDevices(),
        audioDevices: this.rtcEngine.getAudioRecordingDevices(),
        audioPlaybackDevices: this.rtcEngine.getAudioPlaybackDevices(),
        camera: 0,
        mic: 0,
        speaker: 0,
        videoProfile: 43
      }
    }
```

#### Add Functionality to componentDidMount

The `componentDidMount()` is called after the view is mounted in the sample application.

Subscribe to the application event listeners using `this.subscribeEvents()`.

``` JavaScript
  componentDidMount() {
    this.subscribeEvents()
  }   
```

#### Create the subscribeEvents Method

The `subscribeEvents` method adds event listeners to the Agora engine using `this.rtcEngine.on()`.

``` JavaScript
  subscribeEvents = () => {
  	
  	...
  	
  }
```

The remaining code in this section are contained within the `subscribeEvents` method.

- [The `joinedchannel` Event Listener and Callback](#the-joinedchannel-event-listener-and-callback)
- [The `userjoined` Event Listener and Callback](#the-userjoined-event-listener-and-callback)
- [The `removestream` Event Listener and Callback](#the-removestream-event-listener-and-callback)
- [The `leavechannel` Event Listener and Callback](#the-leavechannel-event-listener-and-callback)
- [The `audiovolumeindication` Event Listener and Callback](#the-audiovolumeindication-event-listener-and-callback)
- [The `error` Event Listener and Callback](#the-error-event-listener-and-callback)

##### The `joinedchannel` Event Listener and Callback

The `joinedchannel` event listener triggers when a user joins the `channel`.

Set the state's `local` property to `uid`.

``` JavaScript
    this.rtcEngine.on('joinedchannel', (channel, uid, elapsed) => {
      this.setState({
        local: uid
      })
    });
```

##### The `userjoined` Event Listener and Callback

The `userjoined` event listener triggers when a new user joins the current channel.

Add `uid` to the users list with `this.state.users.push()` and set its value to the state's `users` property.

``` JavaScript
    this.rtcEngine.on('userjoined', (uid, elapsed) => {
      this.setState({
        users: this.state.users.push(uid)
      })
    })
```

##### The `removestream` Event Listener and Callback

The `removestream` event listener triggers when a user's stream is removed.

Remove `uid` from the users list with `this.state.users.delete()` and set its value to the state's `users` property.

``` JavaScript
    this.rtcEngine.on('removestream', (uid, reason) => {
      this.setState({
        users: this.state.users.delete(this.state.users.indexOf(uid))
      })
    })
```

##### The `leavechannel` Event Listener and Callback

The `leavechannel` event listener triggers when a user leaves the current channel.

Set the state's `local` property to an empty string.

``` JavaScript
    this.rtcEngine.on('leavechannel', () => {
      this.setState({
        local: ''
      })
    })
```

##### The `audiovolumeindication` Event Listener and Callback

The `audiovolumeindication` event listener triggers when the volume levels change.

Log the following information using `console.log()`:

Variable|Description
---|---
`uid`|User ID
`volume`|Current volume
`speakerNumber`|Index of the speaker device
`totalVolume`|Total volume

``` JavaScript
    this.rtcEngine.on('audiovolumeindication', (
      uid,
      volume,
      speakerNumber,
      totalVolume
    ) => {
      console.log(`uid${uid} volume${volume} speakerNumber${speakerNumber} totalVolume${totalVolume}`)
    })
```

##### The `error` Event Listener and Callback

The `error` event listener triggers when an error occurs in the Agora RTC Engine.

Log the error information using `console.error()`:

``` JavaScript
    this.rtcEngine.on('error', err => {
      console.error(err)
    })
  }
```

#### Create the handleJoin Method

The `handleJoin` method initializes the Agora RTC engine settings and joins the user to the channel.

The following methods apply the engine's settings:

Method|Description
---|---
`setChannelProfile()`|Sets the channel profile
`setClientRole()`|Sets the user role
`setAudioProfile()`|Sets the audio profile
`enableVideo()`|Enables video
`enableLocalVideo(true)`|Enables local video
`enableWebSdkInteroperability(true)`|Enables interoperability between the Agora Native SDK and the Agora Web SDK
`setVideoProfile()`|Sets the video profile
`enableAudioVolumeIndication()`|Enable regular volume indication reports to the application

Join the channel using `rtcEngine.joinChannel()`.

``` JavaScript
  handleJoin = () => {
    let rtcEngine = this.rtcEngine
    rtcEngine.setChannelProfile(1)
    rtcEngine.setClientRole(this.state.role)
    rtcEngine.setAudioProfile(0, 1)
    rtcEngine.enableVideo()
    rtcEngine.enableLocalVideo(true)
    rtcEngine.enableWebSdkInteroperability(true)
    rtcEngine.setVideoProfile(this.state.videoProfile, false)
    rtcEngine.enableAudioVolumeIndication(1000, 3)
    
    rtcEngine.joinChannel(null, this.state.channel, '',  Number(`${new Date().getTime()}`.slice(7)))
  }
```

#### Create the handleCameraChange Method

The `handleCameraChange` method updates the state's `camera` property using `this.setState()`.

Retrieve the current video device using `this.state.videoDevices[]`. Set the video device using `this.rtcEngine.setVideoDevice()` with the current video device's `deviceid`.

``` JavaScript
  handleCameraChange = e => {
    this.setState({camera: e.currentTarget.value});
    this.rtcEngine.setVideoDevice(this.state.videoDevices[e.currentTarget.value].deviceid);
  }
```

#### Create the handleMicChange Method

The `handleMicChange` method updates the state's `mic` property using `this.setState()`.

Retrieve the current audio recording device using `this.state.audioDevices[]`. Set the audio recording device using `this.rtcEngine.setAudioRecordingDevice()` with the current audio recording device's `deviceid`.

``` JavaScript
  handleMicChange = e => {
    this.setState({mic: e.currentTarget.value});
    this.rtcEngine.setAudioRecordingDevice(this.state.audioDevices[e.currentTarget.value].deviceid);
  }
```

#### Create the handleSpeakerChange Method

The `handleSpeakerChange` method updates the state's `speaker` property using `this.setState()`.

Retrieve the current audio playback device using `this.state.audioPlaybackDevices[]`. Set the audio playback device using `this.rtcEngine.setAudioPlaybackDevice()` with the current audio playback device's `deviceid`.

``` JavaScript
  handleSpeakerChange = e => {
    this.setState({speaker: e.currentTarget.value});
    this.rtcEngine.setAudioPlaybackDevice(this.state.audioPlaybackDevices[e.currentTarget.value].deviceid);
  }
```

#### Create the handleVideoProfile Method

The `handleVideoProfile` method updates the state's `videoProfile` property using `this.setState()`.

``` JavaScript
  handleVideoProfile = e => {
    this.setState({
      videoProfile: Number(e.currentTarget.value)
    })
  }
```

#### Render the View

The `render()` method renders the view for the `App`.

Within the `return()`, a `<div>` element is defined with the class name `columns` and the following properties:

Property|Value|Description
---|---|---
`padding`|`20px`|Sets the padding around the element
`height`|`100%`|Sets the element to full height
`margin`|`0`|Sets the margin around the element


The remaining code is contained with the `<div>` element.

``` JavaScript
  render() {
    return (
      <div className="columns" style={{padding: "20px", height: '100%', margin: '0'}}>
    	
    	...
    	
      </div>
    )
  }
```

#### Build the Form Interface

Add a child `<div>` element with the class name `column` and `is-one-quarter` and an `overflowY` value of `auto`.

``` JavaScript
        <div className="column is-one-quarter" style={{overflowY: 'auto'}}>
        
        ...
        
        </div>
```

- [Add the Channel Field](#add-the-channel-field)
- [Add the Role Field](#add-the-role-field)
- [Add the Video Profile Field](#add-the-video-profile-field)
- [Add the Audio Profile Fields](#add-the-audio-profile-fields)
- [Add the Camera Field](#add-the-camera-field)
- [Add the Microphone Field](#add-the-microphone-field)
- [Add the Speaker Field](#add-the-speaker-field)
- [Add the Join Button](#add-the-join-button)

##### Add the Channel Field

Add a `<div>` element with the class name `field`.

Within the `<div>` element:

1. Add a `Channel` text wrapped in a `<label>` element with the class name `label`
2. Add a text `<input>` element wrapped in a `<div>` element with the class name `control`
	- Apply an `onChange` event listener to update the state's `channel` property
	- Set the `value` property to the state's `channel` property
	- Apply the class `input`
	- Set the `placeholder` property to `Input a channel name`

``` JavaScript
          <div className="field">
            <label className="label">Channel</label>
            <div className="control">
              <input onChange={e => this.setState({channel: e.currentTarget.value})} value={this.state.channel} className="input" type="text" placeholder="Input a channel name" />
            </div>
          </div>
```

##### Add the Role Field

Add a `<div>` element with the class name `field`.

Within the `<div>` element:

1. Add a `Role` text wrapped in a `<label>` element with the class name `label`
2. Add a `<select>` menu element wrapped in a set of nested `<div>` elements with the class name `control` and `select`
	- Apply an `onChange` event listener to update the state's `role` property
	- Set the `value` property to the state's `role` property
	- Set the `width` to `100%`
	- Add two role options `Anchor` and `Audience` with the values `1` and `2`

``` JavaScript
          <div className="field">
            <label className="label">Role</label>
            <div className="control">
              <div className="select"  style={{width: '100%'}}>
                <select onChange={e => this.setState({role: e.currentTarget.value})} value={this.state.role} style={{width: '100%'}}>
                  <option value={1}>Anchor</option>
                  <option value={2}>Audience</option>
                </select>
              </div>
            </div>
          </div>
```

##### Add the Video Profile Field

Add a `<div>` element with the class name `field`.

Within the `<div>` element:

1. Add a `VideoProfile` text wrapped in a `<label>` element with the class name `label`
2. Add a `<select>` menu element wrapped in a set of nested `<div>` elements with the class name `control` and `select`
	- Apply an `onChange` event listener to invoke the `this.handleVideoProfile` method
	- Set the `value` property to the state's `videoProfile` property
	- Set the `width` to `100%`
	- Loop through the video profile list using `videoProfileList.map`, setting the key and value properties to `item.value` and the label to `item.label`

``` JavaScript
          <div className="field">
            <label className="label">VideoProfile</label>
            <div className="control">
              <div className="select"  style={{width: '100%'}}>
                <select onChange={this.handleVideoProfile} value={this.state.videoProfile} style={{width: '100%'}}>
                  {videoProfileList.map(item => (<option key={item.value} value={item.value}>{item.label}</option>))}
                </select>
              </div>
            </div>
          </div>
```

##### Add the Audio Profile Fields

Add a `<div>` element with the class name `field`.

Within the `<div>` element:

1. Add a `AudioProfile` text wrapped in a `<label>` element with the class name `label`
2. Add two `<select>` menu elements wrapped in a set of nested `<div>` elements with the class name `control` and `select`

The first `<select>` menu element controls the audio profiles:

- Apply an `onChange` event listener to invoke the `this.handleAudioProfile` method
- Set the `value` property to the state's `audioProfile` property
- Set the `width` to `100%`
- Loop through the audio profile list using `audioProfileList.map`, setting the key and value properties to `item.value` and the label to `item.label`


The second `<select>` menu element controls the audio scenarios:

- Apply an `onChange` event listener to invoke the `this.handleAudioScenario` method
- Set the `value` property to the state's `audioScenario` property
- Set the `width` to `100%`
- Loop through the audio scenario list using `audioScenarioList.map`, setting the key and value properties to `item.value` and the label to `item.label`

``` JavaScript
          <div className="field">
            <label className="label">AudioProfile</label>
            <div className="control">
              <div className="select"  style={{width: '50%'}}>
                <select onChange={this.handleAudioProfile} value={this.state.audioProfile} style={{width: '100%'}}>
                  {audioProfileList.map(item => (<option key={item.value} value={item.value}>{item.label}</option>))}
                </select>
              </div>
              <div className="select"  style={{width: '50%'}}>
                <select onChange={this.handleAudioScenario} value={this.state.audioScenario} style={{width: '100%'}}>
                  {audioScenarioList.map(item => (<option key={item.value} value={item.value}>{item.label}</option>))}
                </select>
              </div>
            </div>
          </div>
```

##### Add the Camera Field

Add a `<div>` element with the class name `field`.

Within the `<div>` element:

1. Add a `Camera` text wrapped in a `<label>` element with the class name `label`
2. Add a `<select>` menu element wrapped in a set of nested `<div>` elements with the class name `control` and `select`
	- Apply an `onChange` event listener to invoke the `this.handleCameraChange` method
	- Set the `value` property to the state's `videoProfile` property
	- Set the `width` to `100%`
	- Loop through the video devices list using `this.state.videoDevices.map`, setting the key and value properties to `index` and the label to `item.devicename`

``` JavaScript
          <div className="field">
            <label className="label">Camera</label>
            <div className="control">
              <div className="select"  style={{width: '100%'}}>
                <select onChange={this.handleCameraChange} value={this.state.camera} style={{width: '100%'}}>
                  {this.state.videoDevices.map((item, index) => (<option key={index} value={index}>{item.devicename}</option>))}
                </select>
              </div>
            </div>
          </div>
```

##### Add the Microphone Field

Add a `<div>` element with the class name `field`.

Within the `<div>` element:

1. Add a `Microphone` text wrapped in a `<label>` element with the class name `label`
2. Add a `<select>` menu element wrapped in a set of nested `<div>` elements with the class name `control` and `select`
	- Apply an `onChange` event listener to invoke the `this.handleMicChange` method
	- Set the `value` property to the state's `mic` property
	- Set the `width` to `100%`
	- Loop through the audio devices list using `this.state.audioDevices.map`, setting the key and value properties to `index` and the label to `item.devicename`

``` JavaScript
          <div className="field">
            <label className="label">Microphone</label>
            <div className="control">
              <div className="select"  style={{width: '100%'}}>
                <select onChange={this.handleMicChange} value={this.state.mic} style={{width: '100%'}}>
                  {this.state.audioDevices.map((item, index) => (<option key={index} value={index}>{item.devicename}</option>))}
                </select>
              </div>
            </div>
          </div>
```

##### Add the Speaker Field

Add a `<div>` element with the class name `field`.

Within the `<div>` element:

1. Add a `Loudspeaker` text wrapped in a `<label>` element with the class name `label`
2. Add a `<select>` menu element wrapped in a set of nested `<div>` elements with the class name `control` and `select`
	- Apply an `onChange` event listener to invoke the `this.handleSpeakerChange` method
	- Set the `value` property to the state's `speaker` property
	- Set the `width` to `100%`
	- Loop through the audio playback devices list using `this.state.audioPlaybackDevices.map`, setting the key and value properties to `index` and the label to `item.devicename`

``` JavaScript
          <div className="field">
            <label className="label">Loudspeaker</label>
            <div className="control">
              <div className="select"  style={{width: '100%'}}>
                <select onChange={this.handleSpeakerChange} value={this.state.speaker} style={{width: '100%'}}>
                  {this.state.audioPlaybackDevices.map((item, index) => (<option key={index} value={index}>{item.devicename}</option>))}
                </select>
              </div>
            </div>
          </div>
```

##### Add the Join Button

Add a `<div>` element with the class names `field`, `is-grouped`, and `is-grouped-right`.

Within the `<div>` element, add another a `<div>` element with the class name `<control>`.

Add a `<button>` element with the class names `button` and `is-link` in the nested `<div>` elements. Add an `onClick` handler to the button to invoke `this.handleJoin`.



``` JavaScript
          <div className="field is-grouped is-grouped-right">
            <div className="control">
              <button onClick={this.handleJoin} className="button is-link">Join</button>
            </div>
          </div>
```

#### Build the Form Interface

Add a child `<div>` element with the class name `column`, `is-three-quarters`, and `window-container`.

Loop through the `users` list using `this.state.users.map()`. For each user, add a `<Window>` element with the following properties:

Property|Description
---|---
`key`|String attribute for the list
`uid`|User ID
`rtcEngine`|Agora RTC engine
`local`|Indicates if the user is local

Determine if the current user is local using `this.state.local`. If the current user is local, add a `<Window>` element with the same properties as the users list `<Window>` elements, except the `key` property.

``` JavaScript
        <div className="column is-three-quarters window-container">
          {this.state.users.map((item, key) => (
            <Window key={key} uid={item} rtcEngine={this.rtcEngine} local={false}></Window>
          ))}
          {this.state.local ? (<Window uid={this.state.local} rtcEngine={this.rtcEngine} local={true}>

          </Window>) : ''}
        </div>
```

### Create the Window Class

The `Window` class extends the `Component` class and manages the contents in the browser window.

The `constructor()` method passes in the properties parameter `props`. This method called before the `Window` view is mounted. Invoke `super(props)` first, to ensure `this.props` is defined for the class.

The remaining code in this section are contained within the `class` declaration.

``` JavaScript
class Window extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }
  
  ...
  
}
```

The `componentDidMount()` is called after the view is mounted.

Initialize a local variable `dom` with the object with the element ID `video-${this.props.uid}`.

- If the `local` property and `dom` is valid, set up the local video with the `dom` using `this.props.rtcEngine.setupLocalVideo()`
- If the `local` property is invald and `dom` is valid, subscribe the user to the Agora RTC engine using `this.props.rtcEngine.subscribe()`

``` JavaScript
  componentDidMount() {
    let dom = document.querySelector(`#video-${this.props.uid}`)
    if (this.props.local) {
      dom && this.props.rtcEngine.setupLocalVideo(dom)
    } else {
      dom && this.props.rtcEngine.subscribe(this.props.uid, dom)
    }
  }
```

The `render()` method renders the view for the `Window`.

Within the `return()`, a `<div>` element is defined with the class name `window-item`.

Add a secondary `<div>` element with the `id` value of `'video-' + this.props.uid` and class `video-item`.

``` JavaScript
  render() {
    return (
      <div className="window-item">
        <div className="video-item" id={'video-' + this.props.uid}></div>

      </div>
    )
  }
```


## Resources
* Complete API documentation is available at the [Document Center](https://docs.agora.io/en/).
* You can file bugs about this sample [here](https://github.com/AgoraIO-Community/Agora-Electron-Quickstart/issues).
* **Very** basic boilerplate quickstart for the [Agora RTC SDK for Electron](https://github.com/AgoraIO-Community/Agora-RTC-SDK-for-Electron).
* General information about building apps with [React](https://github.com/facebook/react) and the [Electron Webpack](https://github.com/electron-userland/electron-webpack).


## License
This software is under the MIT License (MIT). [View the license](LICENSE.md).