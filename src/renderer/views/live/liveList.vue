<template>
  <div class="live-container bg-white">
    <div class="btns">
      <div>
        <a-button @click="getList(false)">刷新列表</a-button>
        <a-button @click="getList(true)">加载更多</a-button>
      </div>
    </div>
    <a-table :columns="tableColumns" :data-source="liveList" bordered
      row-key="liveId" :loading="loading">
      <template slot="teamLogo" slot-scope="text">
        <img :src="$sourceUrl + text" class="img-team" />
      </template>
      <template slot="liveType" slot-scope="text">
        <a-tag color="red" v-if="text === 1">视频</a-tag>
        <a-tag color="green" v-else>电台</a-tag>
      </template>
      <template slot="ctime" slot-scope="text">
       <span>{{ text | formatTime }}</span>
      </template>
      <template slot="operator" slot-scope="record">
        <!-- <span>{{record}}</span> -->
        <a-button-group>
          <a-button @click="onDownload(record, 1)">下载图片</a-button>
          <a-button
            @click="onDownload(record, 2)"
            :type="record.liveLoading  ? 'danger' : ''"
          >{{record.liveLoading ? '停止录制' : '录制直播'}}</a-button>
        </a-button-group>
      </template>
    </a-table>
    <download-image
      :coverImage="images.coverImage"
      :carousels="images.carousels"
      :show.sync="images.show"
      @onDownloadImage="onDownloadImage"
     />
  </div>
</template>
<script>
import { Tag } from 'ant-design-vue';
import { getFileDate } from '@/utils';
import path from 'path';
import DownloadImage from '@/components/downloadImage.vue';
import { requestDownloadFileByStream } from '@/services/download';
import timeMixin from '@/mixin/live';
import VideoDownloadWorker from 'worker-loader!../../services/video_download.worker';
const column = [
  {
    title: '姓名',
    dataIndex: 'userInfo.nickname'
  },
  {
    title: '队伍',
    dataIndex: 'userInfo.teamLogo',
    scopedSlots: { customRender: 'teamLogo' }
  },
  {
    title: '直播时间',
    dataIndex: 'ctime',
    scopedSlots: { customRender: 'ctime' }
  },
  {
    title: '直播标题',
    dataIndex: 'title'
  },
  {
    title: '直播类型',
    dataIndex: 'liveType',
    scopedSlots: { customRender: 'liveType' }
  },
  {
    title: '操作',
    key: 'operator',
    scopedSlots: { customRender: 'operator' }
  }
];
const IMAGE = 1; // 图片
const RECORD = 2; // 直播录制
export default {
  data() {
    return {
      page: 1,
      queryParams: {
        next: 0,
        record: false,
        groupId: 0,
        teamId: 0,
        userId: 0
      },
      loading: false,
      liveList: [],
      tableColumns: column,
      images: {
        coverImage: '',
        carousels: [],
        show: false
      },
      noNext: false
    }
  },
  mixins: [timeMixin],
  created() {
    this.getList()
  },

  methods: {
    // 直播列表
    getList(more = false) {
      if (!more) {
        this.queryParams.next = 0;
      } else if(this.noNext) {
        return this.$message.warning('没有更多内容了');
      }
      this.loading = true;
      this.$api.getLiveList(this.queryParams).then(res => {
        if (res.success) {
          this.next = res.content.next;
          this.noNext = !!!Number(res.content.next);
          const arr = res.content.liveList.map(item => {
            let liveLoading = false;
            this.downloadList.forEach(ele => {
              if (ele.id === item.liveId) {
                liveLoading = true;
              }
            })
            return {
              ...item,
              liveLoading
            }
          });
          if (more) {
            this.liveList = this.liveList.concat(arr);
          } else {
            this.liveList = arr;
          }
        } else {
          this.$message.error('获取列表失败');
        }
      }).finally(() => (this.loading = false))
    },
    // 显示图片弹窗
    showDownloadImage(record) {
      this.images.coverImage = this.$sourceUrl + record.coverPath;
      if (record.liveDetail.carousels) {
        this.images.carousels = record.liveDetail.carousels.carousels.map(item => (this.$sourceUrl + item));
      }
      this.images.show = true;
    },
    // 下载图片
    async onDownloadImage(url) {
      const { base } = path.parse(url);
      const { dialog } = this.$electron.remote;
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: base
        });
        if (result.cancel || !result.filePath) return;
        await requestDownloadFileByStream(url, result.filePath);
        this.$message.success('图片下载成功');
      } catch(err) {
        this.$message.error('图片下载失败');
      }
    },
    // 录制直播, flv 格式
    async onDownloadFlv(record) {
      const ctime = getFileDate(record.ctime);
      const { dialog } = this.$electron.remote;
      const _this = this;
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: `[直播]${record.userInfo.nickname}_${record.title}_${ctime}.flv`
        });
        if (result.canceled || !result.filePath) return;
        const worker = new VideoDownloadWorker();
        worker.addEventListener('message', function(e) {
          const { type } = e.data;
          if (type === 'error' || type === 'close') {
            if (type === 'error') {
              _this.$message.error('录播文件下载失败');
            } else if(type === 'close') {
              _this.$message.success('文件下载成功');
            }
            record.liveLoading = false;
            worker.terminate();
            _this.$store.dispatch('deleteItemInLiveVideoList', record.liveId);
          } else if (type === 'process') {
            console.log('正在下载')
          }
        }, false);
        record.liveLoading = true;
        this.$store.dispatch('setLiveVideoList', {
          id: record.liveId,
          worker
        });
        worker.postMessage({
          ffmpeg: this.ffmpeg,
          playStreamPath: record.liveDetail.playStreamPath,
          filePath: result.filePath,
          type: 'start'
        });
      } catch(err) {
        record.liveLoading = false;
        console.log('err', err)
        this.$message.error('文件下载失败');
      }
    },
    // 停止录制
    onStopDownloadFlv(record) {
      record.liveLoading = false;
      this.downloadList.forEach(item => {
        if (item.id === record.liveId) {
          item.worker.postMessage({
            type: 'stop'
          });
          item.worker.terminate();
        }
      })
      this.$store.dispatch('deleteItemInLiveVideoList', record.liveId);
    },
    // 下载
    async onDownload(record, type) {
      try {
        if (!record.liveDetail) {
          const result = await this.$api.getLiveOne(record.liveId);
          record.liveDetail = result.content;
        }
        if (type === IMAGE) {
          this.showDownloadImage(record);
        } else if (type === RECORD) {
          if (record.liveLoading) {
            this.onStopDownloadFlv(record);
          } else {
            this.onDownloadFlv(record);
          }
        }
      } catch(err) {
        console.log('error', err);
      }
    }
  },
  computed: {
    downloadList() {
      return this.$store.state.liveVideoList
    }
  },
  components: {
    ATag: Tag,
    DownloadImage
  }
}
</script>
<style lang="scss">
.live-container {
  padding: 20px;
  .btns {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  .img-team {
    width: 26px;
  }
}
</style>