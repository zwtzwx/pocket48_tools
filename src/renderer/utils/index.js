export const TEAMOBJ = {
  snh48_s2: 'SII',
  snh48_n2: 'NII',
  snh48_h2: 'HII',
  snh48_x: 'X',
  gnz48_g: 'G',
  gnz48_n3: 'NIII',
  gnz_z: 'Z',
  snh48_team_yubeisheng: 'YUBEI',
  idft_logo: 'IDFT'
}

export function padLeft(data, len = 2, sym = '0') {
  return (new Array(len + 1).join(sym) + data).slice(-len);
}

// 获取文件时间 年月日
export function getFileDate(time) {
  let date = null;
  if (time) {
    date = new Date(Number(time));
  } else {
    date = new Date();
  }
  return `${date.getFullYear()}${padLeft(date.getMonth() + 1)}${padLeft(date.getDate())}`;
}

export function getMemberMelee(arr = []) {
  return arr.map(item => {
    let userTeam = '';
    if (item.baseUserInfo.teamLogo) {
      userTeam = getMemberTeam(item.baseUserInfo.teamLogo);
    }
    return {
      melee: item.melee, // 应援值
      meleeStr: (item.melee / 10000).toFixed(2),
      rankNum: item.rankNum, // 排名
      userId: item.baseUserInfo.userId,
      nickname: item.baseUserInfo.nickname,
      teamLogo: item.baseUserInfo.teamLogo,
      topFans: item.topUserInfo.nickname,
      team: userTeam || 'OTHER'
    }
  })
}

function getMemberTeam(logo = '') {
  let team = '';
  for (const key in TEAMOBJ) {
    if (TEAMOBJ.hasOwnProperty.call(TEAMOBJ, key)) {
      if (logo.indexOf(key) !== -1) {
        team = TEAMOBJ[key];
      }
    }
  }
  if (!team) {
    switch (logo) {
      case '/20200603/1591182591234C5oe14AgSR.png':
      case '/20200707/1594110398511Jv6zZDpj4m.png':
        team = 'OTHER'
        break;
      default:
        team = 'BEJ48';
        break;
    }
  }
  return team;
}