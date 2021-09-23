<template>
  <div class="home-container">
    <div>
      <button class="btn-main-hotpink" @click="$router.push({ name: 'liveList' })">直播列表</button>
      <button class="btn-main-blue" @click="goRecord">录播列表</button>
    </div>
    <div class="second-menu">
      <button class="btn-main-orange" @click="$router.push({ name: 'melee' })">鸡腿榜</button>
      <button class="btn-main-green" @click="$router.push({ name: 'follower' })">房间关注数</button>
    </div>
    <div class="second-menu">
      <button class="btn-main-red" @click="visible = true">配置FFmpeg</button>
      <button class="btn-main-red" @click="onTest">测试</button>
    </div>
    <a-modal
      title="配置 FFmpeg"
      :visible="visible"
      class="ffmpeg-dialog"
      okText="确认"
      cancelText="取消"
      @ok="onSaveFFmpeg"
      @cancel="onCloseDialog"
    >
      <div>
        <button class="btn-main-hotpink circle" @click="onOPenFFmpegDownload">还没有FFmpeg? 去下载</button>
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
      </div>
    </a-modal>
    
  </div>
</template>
<script>
import { Input } from 'ant-design-vue'
import { getTicketItem } from '@/services/tickets'
export default {
  data() {
    return {
      visible: false,
      ffmpegLink: ''
    }
  },
  created() {
    if (localStorage.getItem('ffmpeg')) {
      this.ffmpegLink = localStorage.getItem('ffmpeg');
    }
  },
  methods: {
    goRecord() {
      this.$router.push({ name: 'recordList' })
    },
    // 浏览打开 ffmpeg 下载地址
    onOPenFFmpegDownload() {
      const { shell } = this.$electron.remote;
      shell.openExternal('https://ffmpeg.org/download.html');
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
      this.visible = false;
    },
    onCloseDialog() {
      this.ffmpegLink = localStorage.getItem('ffmpeg') || '';
      this.visible = false;
    },
    onTest() {
      // this.$api.getTicketItem({
      //   originUrl: 'https://shop.48.cn/tickets/item/4238',
      //   headers: {
      //     // cookie: 'SessionID=5s5qb0fnjg45iidvghkos5fs; route=46bf5666bf631c4b75db945ee8ab5a17; Hm_lvt_f32737cfa62ed971bb3185792d3204eb=1629862026,1630318292; Hm_lpvt_f32737cfa62ed971bb3185792d3204eb=1630318349'
      //   }
      // }).then(res => {
      //   console.log(res)
      // })
      // getTicketItem('4247').then(res => {
      //   console.log('header', res.headers);
      //   console.log(res.body)
      // })
      let d = {}
      d.oncd = function() {}
      this.$store.dispatch('saveFFmpeg', { d })
    }
  },
  components: {
    AInput: Input
  }
}
</script>
<style lang="scss">
.home-container {
  padding: 30px 0 0 20px;
  .second-menu {
    margin-top: 30px;
  }
}
.ffmpeg-dialog {
  .link-box {
    margin-top: 15px;
    display: flex;
  }
  .choose-btn {
    margin-left: 10px;
  }
}
</style>
