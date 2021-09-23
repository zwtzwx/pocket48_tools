<template>
  <div class="melee-container bg-white">
    <div class="show-box">
      <div class="left-show">
        <div class="query-box">
          <a-select v-model="queryParams.rankId" @change="onWeekChange">
            <a-select-option v-for="item in weekList"
              :key="item.weekRankId">{{item.weekRankName}}</a-select-option>
          </a-select>
          <a-select v-model="team" placeholder="队伍名称"
            style="width: 120px" allowClear>
            <a-select-option v-for="item in teamList"
              :key="item">{{item}}</a-select-option>
          </a-select>
          <a-button type="primary" @click="onSaveExcel(0)">导出EXCEL</a-button>
        </div>
        <a-table bordered
          :columns="tableColumn"
          :loading="tableLoading"
          :pagination="{
            showSizeChanger: true,
            defaultPageSize: 15
          }"
          rowKey="userId"
          @expand="onInnerExpand"
          :dataSource="showMemberMeleeList">
          <template slot="teamLogo" slot-scope="text">
            <img v-if="text" :src="$sourceUrl + text" class="img-team" />
            <span v-else>毕业生</span>
          </template>

          <a-table
            slot="expandedRowRender"
            slot-scope="text"
            :columns="innerColumn"
            :loading="text.innerLoading"
            :data-source="text.topUsers"
            rowKey="rankNum"
            :pagination="false"
          >
          </a-table>

        </a-table>
      </div>
      <div class="right-show">
        <div class="title"><span>一周总值：</span><span class="font-bold">{{ (totalMelle / 1000).toFixed(2) }}万</span></div>
        <div id="teamPo" class="charts"></div>
        <div class="title">
          <span>队伍：</span>
          <a-select v-model="chartTeam" @change="setTeamOptions" style="width: 120px">
            <a-select-option v-for="item in teamList.filter(item => (item !== 'IDFT' && item !== 'YUBEI'))"
              :key="item">{{item}}</a-select-option>
          </a-select>
        </div>
        <div id="aTeamPo" class="charts"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { Select, Input } from 'ant-design-vue';
import { getMemberMelee, TEAMOBJ } from '@/utils';
import { exportExcelFile } from '@/services/download';
import * as echarts from 'echarts';
import * as xlsx from 'node-xlsx';
const columns = [
  {
    title: '排名',
    dataIndex: 'rankNum'
  },
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
    title: '应援值(万)',
    dataIndex: 'meleeStr'
  },
  {
    title: '头号粉丝',
    dataIndex: 'topFans'
  }
];

const innerColumn = [
  { title: '排名', dataIndex: 'rankNum' },
  { title: '粉丝名称', dataIndex: 'nickname' },
  { title: '应援值(万)', dataIndex: 'meleeStr'  }
]

export default {
  data() {
    return {
      weekList: [],
      queryParams: {
        nextId: 0,
        rankId: 0
      },
      tableColumn: columns,
      innerColumn: innerColumn,
      memberMeleeList: [],
      totalMelle: 0,
      tableLoading: false,
      teamList: [
        'TEAM SII',
        'TEAM NII',
        'TEAM HII',
        'TEAM X',
        'TEAM G',
        'TEAM NIII',
        'TEAM Z',
        'BEJ48',
        'IDFT',
        'YUBEI'
      ],
      team: undefined,
      keyword: '',
      chartTeam: 'TEAM SII',
      myChart: null,
      myTeamChart: null
    }
  },
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input
  },
  created() {
  },
  mounted() {
    this.$nextTick(function() {
      this.initCharts()
      this.getRankList()
    })
  },
  methods: {
    getRankList() {
      this.$api.getGiftList().then(res => {
        if (res.success) {
          this.weekList = res.content.weekRankList;
          this.queryParams.rankId = this.weekList[0].weekRankId;
          // this.queryParams.nextId = res.content.meleeRank.nextId;
          this.getWeekList();
        }
      })
    },
    onWeekChange() {
      this.queryParams.nextId = 0;
      this.memberMeleeList = [];
      this.getWeekList();
    },
    // 获取每位成员的一周应援 top 粉丝
    onInnerExpand(expanded, record) {
      if (expanded && !record.topUsers.length) {
        record.innerLoading = true;
        this.$api.getPersonMelee({
          resId: record.userId
        }).then(res => {
          if (res.success) {
            record.topUsers = res.content.charmInfo.map(item => {
              return {
                rankNum: item.rankNum,
                nickname: item.userInfo.nickname,
                meleeStr: (item.totalCharm / 10000).toFixed(2)
              }
            });
            record.innerLoading = false;
          }
        }).catch(() => (record.innerLoading = false));
      }
    },
    // 每周成员鸡腿榜
    async getWeekList() {
      let flag = true;
      this.tableLoading = true;
      try {
        while(flag) {
          const result = await this.$api.getGiftListWeek(this.queryParams);
          let arr = result.content.rankUserList;
          if (arr.length) {
            this.queryParams.nextId = result.content.nextId;
            arr = getMemberMelee(arr).map(item => {
              return {
                ...item,
                topUsers: [],
                innerLoading: false
              }
            })
            this.memberMeleeList = this.memberMeleeList.concat(arr);
          } else {
            flag = false;
          }
        }
        this.setOptions();
        this.setTeamOptions();
      } catch(err) {
        console.log('err', err);
      } finally {
        this.tableLoading = false;
      }
    },
    // 导出Excel
    onExportExcel() {
      const _this = this;
      this.$confirm({
        content: '是否同时获取每位成员应援榜前10？',
        cancelText: '不需要',
        okText: '获取',
        onOk() {
          _this.onSaveExcel(1);
        },
        onCancel() {
          _this.onSaveExcel(0);
        }
      })
    },
    async onSaveExcel(type) {
      const { dialog } = this.$electron.remote;
      const weekName = this.weekList.filter(item => item.weekRankId === this.queryParams.rankId)
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: `鸡腿榜_${weekName[0].weekRankName}.xlsx`,
          filters: [{ name: 'excel', extensions: ['xlsx'] }]
        });
        if (result.canceled || !result.filePath) return;
        const sheet1 = [['排名', '成员', '队伍', '鸡腿(万)', '详细鸡腿值']];
        this.memberMeleeList.forEach(item => {
          sheet1.push([item.rankNum, item.nickname, item.team, item.meleeStr, item.melee]);
        });
        const sheet2 = ['成员', '贡献榜聚聚', '贡献值'];
        const merge = [];
        if (type) {
          // 获取每位成员应援榜前10
          for(let i = 0; i < this.memberMeleeList.length; i++) {
            const item = this.memberMeleeList[i];
            const topList = await this.$api.getGiftListTop({ resId: item.userId});
            topList.content.charmInfo.forEach((ele, index) => {
              if (index === 0) {
                sheet2.push([item.nickname, ele.userInfo.nickname, ele.totalCharm]);
              } else {
                sheet2.push([null, ele.userInfo.nickname, ele.totalCharm]);
              }
              merge.push({
                s: { c: 0, r: 1 + 10 * index },
                e: { c: 0, r: 10 + 10 * index }
              });
            })
          }
        }
        const options1 = {'!cols': [{ wch: 7 }, { wch: 16 }, { wch: 8 }, { wch: 10 }, { wch: 16 } ]};
        let buffer = null;
        if (type) {
          const options2 = {
            '!merges': merge,
            '!cols': [{ wch: 16 }, { wch: 14 }, { wch: 14 }]
          };
          buffer = xlsx.build([
            {name: "鸡腿榜", data: sheet1, options: options1},
            {name: "贡献榜", data: sheet2, options: options2}
          ]);
        } else {
          buffer = xlsx.build([{name: "鸡腿榜", data: sheet1, options: options1}]);
        }
        await exportExcelFile(buffer, result.filePath);
        this.$message.success('导出成功');
      } catch(err) {
        console.log('error', err);
        this.$message.error('导出失败');
      }
    },
    initCharts() {
      this.myChart = echarts.init(document.getElementById('teamPo'));
      this.myTeamChart = echarts.init(document.getElementById('aTeamPo'));
      window.addEventListener('resize', () => {
        this.myChart.resize();
        this.myTeamChart.resize();
      })
    },
    setOptions() {
      let sii = 0;
      let nii = 0;
      let hii = 0;
      let x = 0;
      let g = 0;
      let niii = 0;
      let z = 0;
      let bej = 0;
      let idft = 0;
      let yubei = 0;
      let other = 0;
      this.memberMeleeList.forEach(item => {
        switch (item.team) {
          case TEAMOBJ.snh48_s2:
            sii += item.melee;
            break;
          case TEAMOBJ.snh48_n2:
            nii += item.melee;
            break;
          case TEAMOBJ.snh48_h2:
            hii += item.melee;
            break;
          case TEAMOBJ.snh48_x:
            x += item.melee;
            break;
          case TEAMOBJ.gnz48_g:
            g += item.melee;
            break;
          case TEAMOBJ.gnz48_n3:
            niii += item.melee;
            break;
          case TEAMOBJ.gnz_z:
            z += item.melee;
            break;
          case TEAMOBJ.snh48_team_yubeisheng:
            yubei += item.melee;
            break;
          case TEAMOBJ.idft_logo:
            idft += item.melee;
            break;
          case 'BEJ48':
            bej += item.melee;
            break;
          default:
            other += item.melee;
            break;
        }
      })
      this.totalMelle = sii + nii + hii + x + g + niii + z + bej + idft + yubei + other;
      const options = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false
        },
        series: [
          {
            name: '应援值',
            type: 'pie',
            radius: ['40%', '70%'],
            emphasis: {
              label: {
                show: true
              }
            },
            label: {
              formatter: '{b}：{d}%'
            },
            data: [
              { value: sii, name: 'SII' },
              { value: nii, name: 'NII' },
              { value: hii, name: 'HII' },
              { value: x, name: 'X' },
              { value: g, name: 'G' },
              { value: niii, name: 'NIII' },
              { value: z, name: 'Z' },
              { value: bej, name: 'BEJ48' },
              { value: yubei, name: '预备生' },
              { value: idft, name: 'IDFT' },
              { value: other, name: '其他' },
            ]
          }
        ]
      };
      this.myChart.setOption(options);
    },
    setTeamOptions() {
      const arr = this.chartTeam.split(' ');
      const key = arr[arr.length - 1];
      const data = this.memberMeleeList.filter(item => item.team === key);
      const options = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false
        },
        series: [
          {
            name: '应援值',
            type: 'pie',
            radius: ['40%', '70%'],
            emphasis: {
              label: {
                show: true
              }
            },
            label: {
              formatter: '{b}：{d}%'
            },
            data: data.map(item => {
              return {
                value: item.melee,
                name: item.nickname
              }
            })
          }
        ]
      };
      this.myTeamChart.setOption(options);
    }
  },
  computed: {
    showMemberMeleeList() {
      let showMemberMeleeList = this.memberMeleeList;
      if (this.team) {
        const arr = this.team.split(' ');
        const key = arr[arr.length - 1];
        showMemberMeleeList = showMemberMeleeList.filter(item => item.team === key);
      }
      if (this.keyword) {
        showMemberMeleeList = showMemberMeleeList.filter(item => (item.nickname.indexOf(this.keyword) !== -1))
      }
      return showMemberMeleeList
    }
  }
}
</script>
<style lang="scss">
.melee-container {
  padding: 20px;
  .query-box {
    margin-bottom: 15px;
  }
  .img-team {
    width: 26px;
  }
  .show-box {
    display: flex;
    justify-content: space-between;
    overflow-x: auto;
  }
  .left-show {
    width: 480px;
  }
  .right-show {
    flex: 1;
    margin-left: 20px;
  }
  .charts {
    width: 100%;
    height: 450px;
  }
  .title {
    padding-left: 30px;
  }
}
@media (max-width: 1100px) {
  .melee-container {
    .show-box {
      flex-direction: column;
    }
    .left-show  {
      width: 100%;
    }
    .title {
      padding-left: 0;
    }
    .right-show  {
      margin-top: 20px;
      margin-left: 0;
    }
  }
}
</style>