<template>
  <div class="columns" :style="{padding: '20px', height: '100%', margin:'0'}">
    <WindowPicker
      v-show="showWindowPicker"
      :windowList="windowList"
      v-on:cancel="onCancel()"
      v-on:submit="handleWindowPicker($event)"
      :style="{
        width: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }"
    />
    <!-- { this.state.showWindowPicker ? windowPicker : '' } -->
    <div class="column is-one-quarter" :style="{overflowY: 'auto'}">
      <div class="field">
        <label class="label">Channel</label>
        <div class="control">
          <input v-model="channel" class="input" type="text" placeholder="Input a channel name">
        </div>
      </div>
      <div class="field">
        <label class="label">Role</label>
        <div class="control">
          <div class="select" :style="{width: '100%'}">
            <select v-model="role" :style="{width: '100%'}">
              <option :value="1">Anchor</option>
              <option :value="2">Audience</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">VideoProfile</label>
        <div class="control">
          <div class="select" :style="{width: '100%'}">
            <select v-model="videoProfile" :style="{width: '100%'}">
              <option
                v-for="item in videoProfileList"
                :key="item.value"
                :value="item.value"
              >{{item.label}}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">AudioProfile</label>
        <div class="control">
          <div class="select" :style="{width: '49%'}">
            <select v-model="audioProfile" :style="{width: '100%'}">
              <option
                v-for="item in audioProfileList"
                :key="item.value"
                :value="item.value"
              >{{item.label}}</option>
            </select>
          </div>
          <div class="select" :style="{width: '49%'}">
            <select v-model="audioScenario" :style="{width: '100%'}">
              <option
                v-for="item in audioScenarioList"
                :key="item.value"
                :value="item.value"
              >{{item.label}}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Camera</label>
        <div class="control">
          <div class="select" :style="{width: '100%'}">
            <select @change="handleCameraChange" :value="camera" :style="{width: '100%'}">
              <option
                v-for="(item, index) in videoDevices"
                :key="index"
                :value="index"
              >{{item.devicename}}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Microphone</label>
        <div class="control">
          <div class="select" :style="{width: '100%'}">
            <select @change="handleMicChange" :value="mic" :style="{width: '100%'}">
              <option
                v-for="(item, index) in audioDevices"
                :key="index"
                :value="index"
              >{{item.devicename}}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Loudspeaker</label>
        <div class="control">
          <div class="select" :style="{width: '100%'}">
            <select @change="handleSpeakerChange" :value="speaker" style="{width: '100%'}">
              <option
                v-for="(item, index) in audioPlaybackDevices"
                :key="index"
                :value="index"
              >{{item.devicename}}</option>
            </select>
          </div>
        </div>
      </div>
      <!-- <div class="field is-grouped is-grouped-right">
        <div class="control">
          <button @click="handleAudioMixing" class="button is-link">Start/Stop Audio Mixing</button>
        </div>
      </div> -->
      <div class="field is-grouped is-grouped-right">
        <div class="control">
          <button @click="handleJoin" class="button is-link">Join</button>
        </div>
      </div>
      <hr>
      <div class="field">
        <label class="label">Screen Share</label>
        <div class="control">
          <button @click="handleScreenSharing" class="button is-link">Screen Share</button>
        </div>
      </div>

      <div class="field">
        <label class="label">Audio Playback Test</label>
        <div class="control">
          <button
            @click="togglePlaybackTest"
            class="button is-link"
          >{{this.playbackTestOn ? 'stop' : 'start'}}</button>
        </div>
      </div>
      <div class="field">
        <label class="label">Audio Recording Test</label>
        <div class="control">
          <button
            @click="toggleRecordingTest"
            class="button is-link"
          >{{this.recordingTestOn ? 'stop' : 'start'}}</button>
        </div>
      </div>
    </div>
    <div class="column is-three-quarters window-container">
      <VideoPlayer
        v-for="(item,key) in users"
        :key="key"
        :uid="item"
        :rtcEngine="rtcEngine"
        :role="item===SHARE_ID?'remoteVideoSource':'remote'"
      />

      <VideoPlayer v-if="local" :uid="local" :rtcEngine="rtcEngine" role="local"/>
      <VideoPlayer
        class="show-local-share-screen"
        v-if="localVideoSource"
        :uid="localVideoSource"
        :rtcEngine="rtcEngine"
        role="localVideoSource"
      />
    </div>
  </div>
</template>

<script>
import AgoraRtcEngine from "agora-electron-sdk";
import { List } from "immutable";
import path from "path";

import {
  videoProfileList,
  audioProfileList,
  audioScenarioList,
  APP_ID,
  SHARE_ID
} from "../utils/settings";
import base64Encode from "../utils/base64";

export default {
  components: {
    VideoPlayer: () => import("./components/VideoPlayer/index.vue"),
    WindowPicker: () => import("./components/WindowPicker/index.vue")
  },
  data() {
    this.videoProfileList = videoProfileList;
    this.audioProfileList = audioProfileList;
    this.audioScenarioList = audioScenarioList;
    return {
      local: "",
      localVideoSource: "",
      users: new List(),
      channel: "",
      role: 1,
      videoDevices: [],
      audioDevices: [],
      audioPlaybackDevices: [],
      camera: 0,
      mic: 0,
      speaker: 0,
      videoProfile: 43,
      showWindowPicker: false,
      recordingTestOn: false,
      playbackTestOn: false,
      windowList: [],
      audioProfile: 0,
      audioScenario: 0,
    };
  },
  methods: {
    subscribeEvents() {
      this.rtcEngine.on("joinedchannel", (channel, uid, elapsed) => {
        this.local = uid;
      });
      this.rtcEngine.on("userjoined", (uid, elapsed) => {
        if (uid === SHARE_ID && this.localVideoSource) {
          return;
        }
        this.rtcEngine.setRemoteVideoStreamType(uid, 1);
        this.users = this.users.push(uid);
      });
      this.rtcEngine.on("removestream", (uid, reason) => {
        this.users = this.users.delete(this.users.indexOf(uid));
      });
      this.rtcEngine.on("leavechannel", () => {
        this.local = "";
      });
      this.rtcEngine.on("audiodevicestatechanged", () => {
        this.audioDevices = this.rtcEngine.getAudioRecordingDevices();
        this.audioPlaybackDevices = this.rtcEngine.getAudioPlaybackDevices();
      });
      this.rtcEngine.on("videodevicestatechanged", () => {
        this.videoDevices = this.rtcEngine.getVideoDevices();
      });
      this.rtcEngine.on(
        "audiovolumeindication",
        (uid, volume, speakerNumber, totalVolume) => {
          console.log(
            `uid${uid} volume${volume} speakerNumber${speakerNumber} totalVolume${totalVolume}`
          );
        }
      );
      this.rtcEngine.on("error", err => {
        console.error(err);
      });
      this.rtcEngine.on("executefailed", funcName => {
        console.error(funcName, "failed to execute");
      });
    },

    handleJoin() {
      let rtcEngine = this.rtcEngine;
      rtcEngine.setChannelProfile(1);
      rtcEngine.setClientRole(this.role);
      rtcEngine.setAudioProfile(0, 1);
      rtcEngine.enableVideo();
      rtcEngine.setLogFile("~/agoraabc.log");
      rtcEngine.enableLocalVideo(true);
      rtcEngine.enableWebSdkInteroperability(true);
      rtcEngine.setVideoProfile(this.videoProfile, false);
      rtcEngine.enableDualStreamMode(true);
      rtcEngine.enableAudioVolumeIndication(1000, 3);
      rtcEngine.joinChannel(
        null,
        this.channel,
        "",
        Number(`${new Date().getTime()}`.slice(7))
      );
    },

    handleCameraChange(e) {
      this.camera = e.currentTarget.value;
      this.rtcEngine.setVideoDevice(
        this.videoDevices[e.currentTarget.value].deviceid
      );
    },

    handleMicChange(e) {
      this.mic = e.currentTarget.value;
      this.rtcEngine.setAudioRecordingDevice(
        this.audioDevices[e.currentTarget.value].deviceid
      );
    },

    handleSpeakerChange(e) {
      this.speaker = e.currentTarget.value;
      this.rtcEngine.setAudioPlaybackDevice(
        this.audioPlaybackDevices[e.currentTarget.value].deviceid
      );
    },

    /**
     * prepare screen share: initialize and join
     * @param {string} token
     * @param {string} info
     * @param {number} timeout
     */
    prepareScreenShare(token = null, info = "", timeout = 30000) {
      return new Promise((resolve, reject) => {
        let timer = setTimeout(() => {
          reject(new Error("Timeout"));
        }, timeout);
        this.rtcEngine.once("videosourcejoinedsuccess", uid => {
          clearTimeout(timer);
          rtcEngine.videoSourceSetLogFile("~/videosourceabc.log");
          this.sharingPrepared = true;
          resolve(uid);
        });
        try {
          let x = this.rtcEngine.videoSourceInitialize(APP_ID);
          console.log(x)
          x = this.rtcEngine.videoSourceSetChannelProfile(1);
          console.log(x)
          x = this.rtcEngine.videoSourceEnableWebSdkInteroperability(true);
          console.log(x);
          // this.rtcEngine.videoSourceSetVideoProfile(50, false);
          // to adjust render dimension to optimize performance
          x = this.rtcEngine.setVideoRenderDimension(3, SHARE_ID, 1200, 680);
          console.log(x);
          x = this.rtcEngine.videoSourceJoin(token, this.channel, info, SHARE_ID);
          console.log(x);
        } catch (err) {
          clearTimeout(timer);
          reject(err);
        }
      });
    },

    /**
     * start screen share
     * @param {*} windowId windows id to capture
     * @param {*} captureFreq fps of video source screencapture, 1 - 15
     * @param {*} rect null/if specified, {x: 0, y: 0, width: 0, height: 0}
     * @param {*} bitrate bitrate of video source screencapture
     */
    startScreenShare(
      windowId = 0,
      captureFreq = 15,
      rect = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      bitrate = 0
    ) {
      if (!this.sharingPrepared) {
        console.error("Sharing not prepared yet.");
        return false;
      }
      return new Promise((resolve, reject) => {
        this.rtcEngine.startScreenCapture2(
          windowId,
          captureFreq,
          rect,
          bitrate
        );
        this.rtcEngine.videoSourceSetVideoProfile(43, false);
        this.rtcEngine.startScreenCapturePreview();
      });
    },

    handleScreenSharing() {
      // getWindowInfo and open Modal
      let list = this.rtcEngine.getScreenWindowsInfo();
      let windowList = list.map(item => {
        return {
          ownerName: item.ownerName,
          name: item.name,
          windowId: item.windowId,
          image: base64Encode(item.image)
        };
      });
      this.showWindowPicker = true;
      this.windowList = windowList;
    },

    handleWindowPicker(windowId) {
      this.showWindowPicker = false;
      this.prepareScreenShare()
        .then(uid => {
          console.log(">>>>>>> prepare");
          this.startScreenShare(windowId);
          this.localVideoSource = uid;
        })
        .catch(err => {
          console.log(err);
        });
    },

    hideWindowPicker() {
      this.showWindowPicker = false;
    },

    togglePlaybackTest() {
      if (!this.playbackTestOn) {
        let filepath =
          "/Users/menthays/Projects/Agora-RTC-SDK-for-Electron/example/temp/music.mp3";
        let result = this.rtcEngine.startAudioPlaybackDeviceTest(filepath);
        console.log(result);
      } else {
        this.rtcEngine.stopAudioPlaybackDeviceTest();
      }
      this.playbackTestOn = !this.playbackTestOn;
    },

    toggleRecordingTest() {
      if (!this.recordingTestOn) {
        let result = this.rtcEngine.startAudioRecordingDeviceTest(1000);
        console.log(result);
      } else {
        this.rtcEngine.stopAudioRecordingDeviceTest();
      }
      this.recordingTestOn = !this.state.recordingTestOn;
    }
  },
  created() {
    this.rtcEngine = new AgoraRtcEngine();
    if (!APP_ID) {
      return alert("APP_ID cannot be empty!");
    } else {
      this.rtcEngine.initialize(APP_ID);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.subscribeEvents();
      this.videoDevices = this.rtcEngine.getVideoDevices()
      this.audioDevices = this.rtcEngine.getAudioRecordingDevices()
      this.audioPlaybackDevices = this.rtcEngine.getAudioPlaybackDevices()
      window.rtcEngine = this.rtcEngine;
    });
  }
};
</script>

