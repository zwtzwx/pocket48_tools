import request from 'axios'

let apis = {}

apis.getItem =  () => {
  request({
    method: 'GET',
    url: 'https://shop.48.cn/tickets/item/4205',
    headers: {
      'User-Agent': 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)',
      'host': 'shop.48.cn'
    }
  }, function (err, res) {
    if (err) {
      console.log('错误', err)
    } else {
      console.log('res', res)
    }
  })
}

export default apis;