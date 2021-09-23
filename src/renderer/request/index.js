import request from './config';
const apis = {};

// 直播列表
apis.getLiveList = (params) => request._post('live/api/v1/live/getLiveList', params);

// 单个直播内容
apis.getLiveOne = (id) => request._post('live/api/v1/live/getLiveOne', { liveId: id });

// 单周鸡腿榜周数
apis.getGiftList = () => request._post('gift/api/v1/melee/rank/getMeleeRankPage');

// 单周鸡腿榜成员数据
apis.getGiftListWeek = (params) => request._post('gift/api/v1/melee/rank/getMeleeWeekRank', params);

// 成员一周鸡腿榜前10
apis.getGiftListTop = (params) => request._post('gift/api/v1/melee/rank/getPersonMeleeRankPage', params);

// 成员关注数
apis.userFollower = (params) => request._post('user/api/v1/user/info/home', params);

// 开屏视频、语音信息
apis.bootAd = () => request._get('/home/api/ad/v2/bootAd');

// 单个成员一周贡献榜
apis.getPersonMelee = (params) => request._post('/gift/api/v1/melee/rank/getPersonMeleeRankPage', params)


apis.getTicketItem = (params) => request._get('tickets/item/4205', params)


export default apis;