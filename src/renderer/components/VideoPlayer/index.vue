<template>
  <div class="window-item">
    <div class="video-item" :id="'video-' + this.uid">
      
    </div>
  </div>
</template>

<script>
import { SHARE_ID } from '../../../utils/settings'

export default {
  data() {
    return {
      loading: false
    }
  },
  props: ["uid", "rtcEngine", "role"],
  mounted() {
    this.$nextTick(() => {
      let dom = document.querySelector(`#video-${this.uid}`)
      if (this.role === 'local') {
        dom && this.rtcEngine.setupLocalVideo(dom)
      } else if (this.role === 'localVideoSource') {
        dom && this.rtcEngine.setupLocalVideoSource(dom)
        this.rtcEngine.setupViewContentMode('videosource', 1);
        this.rtcEngine.setupViewContentMode(SHARE_ID, 1);
      } else if (this.role === 'remote') {
        dom && this.rtcEngine.subscribe(this.uid, dom)
      } else if (this.role === 'remoteVideoSource') {
        dom && this.rtcEngine.subscribe(this.uid, dom)
        this.rtcEngine.setupViewContentMode('videosource', 1);
        this.rtcEngine.setupViewContentMode(SHARE_ID, 1);
      }
    })
  }
}
</script>

