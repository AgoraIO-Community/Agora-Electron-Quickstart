<template>
  <div class="screen-item" :class="{ active: active }">
    <div class="screen-image">
      <div class="content" :style="{ backgroundImage: `url(data:image/png;base64,${image})` }"></div>
    </div>
    <div class="screen-meta">{{ itemName }}</div>
  </div>
</template>
<script>
export default {
  props: ["name", "image", "active"],
  data() {
    let itemName = this.name || 'No Title';
    itemName = itemName.length > 15 ? `${itemName.substring(0, 15)}` : itemName;
    return {
      itemName,
    }
  }
}
</script>
<style>
</style>