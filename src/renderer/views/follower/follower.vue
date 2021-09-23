<template>
  <div class="follower-cotainer bg-white">
    <div class="export-box">
      <a-button @click="onSaveExcel" type="primary" class="export-btn">导出EXCEL</a-button>
    </div>
    <a-table bordered
      rowKey="userId"
      :loading="loading"
      :columns="tableColumns"
      :pagination="{
          showSizeChanger: true,
          defaultPageSize: 15
        }"
      :dataSource="followerList">
      <template slot="teamLogo" slot-scope="text">
        <img v-if="text" :src="$sourceUrl + text" class="img-team" />
        <span v-else>毕业生</span>
      </template>
    </a-table>
  </div>
</template>
<script>
import * as xlsx from 'node-xlsx';
import { getFileDate } from '@/utils';
import member from '@/assets/json/member.json';
import { exportExcelFile } from '@/services/download';
const columns = [
  {
    title: '成员',
    dataIndex: 'nickname'
  },
  {
    title: '队伍',
    dataIndex: 'teamLogo',
    scopedSlots: { customRender: 'teamLogo' }
  },
  {
    title: '房间关注数',
    dataIndex: 'follower'
  }
]
export default {
  data() {
    return {
      followerList: [],
      tableColumns: columns,
      loading: false
    }
  },
  created() {
    this.getList();
  },
  methods: {
    async getList() {
      try {
        this.loading = true;
        const arr = [];
        for (let i = 0; i < member.length; i++) {
          const item = member[i];
          const result = await this.$api.userFollower({ userId: item.userId });
          arr.push({
            ...item,
            follower: result.content.baseUserInfo.followers
          });
        }
        this.followerList = arr.sort((a, b) => {
          if (a.follower < b.follower) {
            return 1;
          } else if (a.follower > b.follower) {
            return -1;
          } else {
            return 0;
          }
        })
        this.loading = false;
      }catch(err) {
        console.log('error', err);
      }
    },
    // 导出 Excel
    async onSaveExcel() {
      const { dialog } = this.$electron.remote;
      const time = getFileDate();
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: `口袋房间关注数_${time}.xlsx`,
          filters: [{ name: 'excel', extensions: ['xlsx'] }]
        });
        if (result.canceled || !result.filePath) return;
        const sheet1 = [['成员', '队伍', '房间关注数']];
        this.followerList.forEach(item => {
          sheet1.push([item.nickname, item.team, item.follower]);
        });
        const options = {
          '!cols': [{ wch: 16 }, { wch: 8 }, { wch: 12 }]
        }
        const buffer = xlsx.build([{ name: '关注数', data: sheet1, options }]);
        await exportExcelFile(buffer, result.filePath);
        this.$message.success('导出成功');
      }catch(err) {
        this.$message.error('导出失败');
      }
    }
  }
}
</script>
<style lang="scss">
.follower-cotainer {
  padding: 50px 40px;
  .export-box {
    margin-bottom: 15px;
    text-align: right;
  }
  .img-team {
    width: 26px;
  }
}
</style>