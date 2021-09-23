
function loadOnPath(view) {
  return () => import(/* webpackChunkName: "chunk" */ '@/views/' + view);
}

// 首页
const Home = loadOnPath('home');
// 录播列表
const RecordList = loadOnPath('live/recordList');
// 直播列表
const LiveList = loadOnPath('live/liveList');
// 鸡腿榜
const meleeList = loadOnPath('melee/melee');
// 房间关注数
const followerList = loadOnPath('follower/follower');
// 口袋开屏
const BootAd = loadOnPath('boot/boot');

// ffmpeg 配置
const Config = loadOnPath('config/config');

export default [
  {
    path: '/config',
    name: 'config',
    component: Config,
    meta: {
      name: '配置 FFmpeg',
      icon: 'setting'
    }
  },
  {
    path: '/melee',
    name: 'melee',
    component: meleeList,
    meta: {
      name: '鸡腿榜',
      icon: 'gift'
    }
  },
  {
    path: '/follower',
    name: 'follower',
    component: followerList,
    meta: {
      name: '房间关注数',
      icon: 'pie-chart'
    }
  },
  {
    path: '/live_list',
    name: 'liveList',
    component: LiveList,
    meta: {
      name: '直播列表',
      icon: 'video-camera'
    }
  },
  {
    path: '/record_list',
    name: 'recordList',
    component: RecordList,
    meta: {
      name: '录播列表',
      icon: 'rocket'
    }
  },
  {
    path: '/boot_ad',
    name: 'bootAd',
    component: BootAd,
    meta: {
      name: '口袋开屏',
      icon: 'customer-service'
    }
  }
]