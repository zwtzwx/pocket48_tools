import createHeaders from './header';
import request from 'request';

const baseUrl = 'https://pocketapi.48.cn/';

const postData = ({
  method,
  url,
  originUrl = '',
  ...params
}) => {
  return new Promise(function(resolve, reject) {
    const headers = createHeaders();
    request({
      method,
      headers,
      url: (originUrl || baseUrl) + url,
      timeout: 120000,
      ...params
    }, function(err, res) {
      console.log('header', headers)
      if (err) {
        console.log('err', err);
        reject(err);
      } else {
        console.log('res', res.body);
        if (typeof res.body === 'string') {
          resolve(JSON.parse(res.body));
        } else {
          resolve(res.body);
        }
      }
    });
  });
}

const _get = function(url, params) {
  return postData({
    method: 'GET',
    url,
    ...params
  });
}

const _post = function(url, params) {
  console.log('req', params)
  return postData({
    method: 'POST',
    url,
    json: true,
    body: params
  });
}

export default {
  _get,
  _post
}