<template>
  <div class="bg-white config-container">
    <div class="content">
      <div class="tips-box">
        <div class="font-bold">提示：</div>
        <div>1、如果需要下载录播或者录制直播视频，请确保已下载好 ffmpeg</div>
        <div>2、下载好 ffmpeg 后，如果已在系统中配置了 ffmpeg 的环境变量，就无需在下面配置地址，否则请在下面配置好 ffmepg 的文件地址</div>
      </div>
      <div class="download">
        <span @click="onOPenFFmpegDownload(1)" class="is-click">还没有FFmpeg? 去下载</span>
        <span @click="onOPenFFmpegDownload(2)" class="is-click">如何配置 ffmpeg 环境变量</span>
      </div>
      <div class="link-box">
        <a-input
          placeholder="粘贴文件地址或者选择文件"
          v-model="ffmpegLink"
          allowClear
        >
        </a-input>
        <a-button
          type="primary"
          class="choose-btn"
          ghost
          @click="onOpenFFmpeg"
        >
          选择文件
        </a-button>
        <a-button
          type="primary"
          class="choose-btn"
          @click="onSaveFFmpeg"
        >
          保存配置
        </a-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Input } from 'ant-design-vue'
export default {
  data() {
    return {
      ffmpegLink: ''
    }
  },
  created() {
    if (localStorage.getItem('ffmpeg')) {
      this.ffmpegLink = localStorage.getItem('ffmpeg');
    }
  },
  methods: {
    // 浏览打开 ffmpeg 下载地址
    onOPenFFmpegDownload(type) {
      const { shell } = this.$electron.remote;
      if (type === 1) {
        shell.openExternal('https://ffmpeg.org/download.html');
      } else {
        shell.openExternal('https://blog.csdn.net/Tang_Chuanlin/article/details/103749351');
      }
    },
    // 选择本地 ffmpeg 地址
    async onOpenFFmpeg() {
      const { dialog } = this.$electron.remote;
      const result = await dialog.showOpenDialog({
        properties: ['openFile']
      });
      if (result.canceled || !result.filePaths.length) return;
      this.ffmpegLink = result.filePaths[0];
    },
    // 保存 ffmpeg 地址
    onSaveFFmpeg() {
      if (this.ffmpegLink) {
        localStorage.setItem('ffmpeg', this.ffmpegLink);
      } else {
        localStorage.removeItem('ffmpeg');
      }
      this.$message.success('保存成功')
    }
  },
  components: {
    AInput: Input
  }
}
</script>

<style lang="scss">
.config-container {
  padding: 50px;
  .content {
    max-width: 500px;
  }
  .link-box {
    margin-top: 15px;
    display: flex;
  }
  .choose-btn {
    margin-left: 10px;
  }
  .download {
    color: #DC143C;
    display: flex;
    justify-content: space-between;
  }
  .tips-box {
    background-color: #d6f5e3;
    color: #69a482;
    padding: 10px 20px;
    margin-bottom: 20px;
  }
}
</style>