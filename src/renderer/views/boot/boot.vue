<template>
  <div class="boot-container bg-white">
    <div>
      <div class="title">当前开屏视频：</div>
      <video
        controls
        class="video"
        :src="videoUrl"
        v-if="videoUrl"
        :poster="cover"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cover: '',
      videoUrl: ''
    }
  },
  created() {
    this.getBootInfo()
  },
  methods: {
    // 获取开屏信息
    getBootInfo() {
      this.$api.bootAd().then(res => {
        console.log(res)
        if (res.content.adType === 4) {
          this.cover = res.content.videoData.imageUrl;
          this.videoUrl = res.content.videoData.videoUrl;
        }  
      })
    }
  }
}
</script>

<style lang="scss">
.boot-container {
  padding: 50px;
  .video {
    width: 100%;
    max-width: 450px;
  }
  .title {
    padding-bottom: 20px;
  }
}
</style>