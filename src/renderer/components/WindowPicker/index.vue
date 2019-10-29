<template>
  <div class="window-picker-mask">
    <div class="window-picker">
      <div class="header">
        <div class="title">请选择需要共享的内容</div>
      </div>
      <div class="screen-container">
        {{windowList.length }}
        <div
          v-for="(item, id) in windowList"
          v-bind:key="id"
          v-bind:style="{
            width: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }"
          @dblclick="() => handleSubmit(item.windowId)"
          @click="() => handleSelect(item.windowId)"
          >
          <WindowItem
            v-bind:active="item.windowId === currentWindowId"
            v-bind:name="item.name"
            v-bind:image="item.image"
            ></WindowItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WindowItem from './WindowItem';
export default {
  components: {
    WindowItem,
  },
  props: ['windowList', 'onCancel', 'onSubmit', 'style'],
  data () {
    return {
      currentWindowId: -1,
    }
  },
  methods: {
    handleSelect: function (windowId) {
      this.currentWindowId = windowId;
    },
    handleSubmit: function () {
      this.$emit("submit", this.currentWindowId);
    },
    handleCancel: function () {
      this.$emit("cancel")
    }
  }
}
</script>

<style>

.screen-container::-webkit-scrollbar-thumb {
  height: 6px;
  background-clip: padding-box;
  border-radius: 7px;
  background-color: #666;
}

.screen-container::-webkit-scrollbar {
  width: 8px;
  height: 18px;
}

::-webkit-scrollbar-button {
  width: 0;
  height: 0;
  display: none;
}

::-webkit-scrollbar-corner {
  background-color: transparent;
}

.window-picker-mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
  background-color: rgba(222,222,222,.3);
}

.window-picker {
  width: 640px;
  height: 480px;
  border-radius: 5px;
  background-color: #333333; 
}

.window-picker .header {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.window-picker .header .title {
  color: #CCCCCC;
  font-size: 11px;
}

.window-picker .footer {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.window-picker .screen-container {
  overflow-y: scroll;
  width: 98%;
  height: calc(100% - 100px);
}

.window-picker .screen-container .screen-item {
  width: 190px;
  height: 131px;
  border-radius: 5px;
  border: 1px solid #666666;
  margin-left: 10px;
}

.window-picker .screen-container .screen-item.active {
  border: 1px solid #197CE1;
}

.window-picker .screen-container .screen-item .screen-image {
  width: 100%;
  height: 106px;
  border-radius: 5px;
  padding: 10px 20px 5px 20px;
}

.window-picker .screen-container .screen-item .screen-image .content {
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
}

.window-picker .screen-container .screen-item .screen-meta {
  width: 100%;
  height: 12px;
  text-align: center;
  font-size: 12px;
  color: #CCCCCC;
}
</style>