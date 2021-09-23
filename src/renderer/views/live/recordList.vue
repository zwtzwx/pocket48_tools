<template>
  <div class="record-live-container bg-white">
    <div class="btns">
      <div>
        <a-button @click="getList(false)">刷新列表</a-button>
        <a-button @click="getList(true)">加载更多</a-button>
      </div>
    </div>
    <a-table :columns="tableColumns" :data-source="liveList" bordered
      row-key="liveId" :loading="loading">
      <template slot="teamLogo" slot-scope="text">
        <img :src="$sourceUrl + text" class="img-team" v-if="text" />
        <span v-else>毕业生</span>
      </template>
      <template slot="liveType" slot-scope="text">
        <a-tag color="red" v-if="text === 1">视频</a-tag>
        <a-tag color="green" v-else>电台</a-tag>
      </template>
      <template slot="ctime" slot-scope="text">
       <span>{{ text | formatTime }}</span>
      </template>
      <template slot="operator" slot-scope="record">
        <a-button-group>
          <a-button @click="onDownload(record, 1)">下载图片</a-button>
          <a-button @click="onDownload(record, 2)"
            :loading="record.lrcLoading">下载弹幕</a-button>
          <a-button
            @click="onDownload(record, 3)"
            :type="record.recordLoading  ? 'danger' : ''"
            >{{ record.recordLoading ? '停止下载' : '下载直播' }}</a-button>
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
import VideoDownloadWorker from 'worker-loader!../../services/video_download.worker';
import timeMixin from '@/mixin/live';
import { worker } from 'cluster';
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
const LRC = 2; // 弹幕文件
const LIVE = 3; // 直播文件
export default {
  data() {
    return {
      page: 1,
      queryParams: {
        next: 0,
        record: true,
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
    // 录播列表
    getList(more = false) {
      if (!more) {
        this.queryParams.next = 0;
      } else if(this.noNext) {
        return this.$message.warning('没有更多内容了');
      }
      this.loading = true;
      this.$api.getLiveList(this.queryParams).then(res => {
        if (res.success) {
          this.queryParams.next = res.content.next;
          this.noNext = !!!Number(res.content.next);
          const arr = res.content.liveList.map(item => {
            let recordLoading = false;
            this.downloadList.forEach(ele => {
              if (ele.id === item.liveId) {
                recordLoading = true;
              }
            })
            return {
              ...item,
              lrcLoading: false,
              recordLoading
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
    // 下载弹幕
    async onDownloadLrc(record) {
      const { ext } = path.parse(record.liveDetail.msgFilePath);
      const ctime = getFileDate(record.ctime);
      const { dialog } = this.$electron.remote;
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: `[弹幕]${record.userInfo.nickname}_${record.title}_${ctime}${ext}`
        });
        if (result.canceled || !result.filePath) return;
        record.lrcLoading = true;
        await requestDownloadFileByStream(record.liveDetail.msgFilePath, result.filePath);
        record.lrcLoading = false;
        this.$message.success('文件下载成功');
      } catch(err) {
        record.lrcLoading = false;
        console.log('err', err)
        this.$message.error('文件下载失败');
      }
    },
    // 下载录播
    async onDownloadM3u8(record) {
      const ctime = getFileDate(record.ctime);
      const { dialog } = this.$electron.remote;
      const _this = this;
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: `[录播]${record.userInfo.nickname}_${record.title}_${ctime}.ts`
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
            record.recordLoading = false;
            worker.terminate();
            _this.$store.dispatch('deleteItemInRecordVideoList', record.liveId);
          } else if (type === 'process') {
            console.log('正在下载')
          }
        }, false);
        record.recordLoading = true;
        this.$store.dispatch('setRecordVideoList', {
          id: record.liveId,
          worker
        });
        worker.postMessage({
          ffmpeg: this.ffmpeg,
          playStreamPath: record.liveDetail.playStreamPath,
          filePath: result.filePath,
          type: 'start',
          protocolWhiteList: true
        });
      } catch(err) {
        record.recordLoading = false;
        console.log('err', err)
        this.$message.error('文件下载失败');
      }
    },
    // 停止下载录播
    onStopDownloadM3u8(record) {
      record.recordLoading = false;
      this.downloadList.forEach(item => {
        if (item.id === record.liveId) {
          item.worker.postMessage({
            type: 'stop'
          });
          item.worker.terminate();
        }
      });
      this.$store.dispatch('deleteItemInRecordVideoList', record.liveId);
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
    // 下载文件
    async onDownload(record, type) {
      try {
        if (!record.liveDetail) {
          const res = await this.$api.getLiveOne(record.liveId);
          record.liveDetail = res.content;
        }
        switch (type) {
          case LRC:
            this.onDownloadLrc(record);
            break;
          case IMAGE:
            this.showDownloadImage(record);
            break;
          case LIVE:
            record.recordLoading ? this.onStopDownloadM3u8(record) : this.onDownloadM3u8(record);
            break;
        }
      }catch(err) {
        console.log('error', err);
      }
    }
  },
  computed: {
    downloadList() {
      return this.$store.state.recordVideoList
    }
  },
  components: {
    ATag: Tag,
    DownloadImage
  }
}
</script>
<style lang="scss">
.record-live-container {
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