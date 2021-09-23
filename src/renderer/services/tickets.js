import request from 'request';

export function getTicketItem(ticket) {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      headers: {
        cookie: '.AspNet.ApplicationCookie=ZY36KXQcZakW0z8_Tg80bKYiwekH1kxkasuIVDE0SRT7e9axqG0i9ATF0V-fmdY22zESiXil1AiuvL--KVcp0ncCAKXg0h1_0pXKcjVA9Q6tPn1xMuYQRJP9bV-akyUEysUD-GxRgD5XmgBLZFLsV1WJ0lBVQAohRsJC4C3YcI7udU92mqNDlCwC65aq_kDCuCfxOMa6uWwi93ZK6sZsk5kaiUHswX81vYmJfnV8juskE3WOjagLKOQGANsWFFioMp0IrpxwPrmFw4wB9e6WyFv3LONLgZy-FhdE1gnnRm6nDEnFdirV8zvAWmL0FxXgMLjuRYXsuc-b1n7htTwV_EKzdmmt28eQVmNRu1kZTq_-B531rwjjAvA1FtNRKftbP_5dGMXfzkrGxoSkIXwUe5I1Ntig2bartOahEeLV7PThCG71e4d406G73BBhrIuWkNm1EzTjit_A5ARMoD_jn5cNI2_8wtvY69CKdG2O91ltwV1rBeXSAXqpFRLJOjG8IZzgDp_xDAkOSjo0226pVgkJKSQfVWZmotPvUwaPHk8RXg33gvXGoGZr4gHnfXlqu4rUT55wW5uLCop1gkjlkGYU6Y2yqF1LPAOyoXgIOutjs3xt; __RequestVerificationToken=UXT_gkmx50jpfjnQUuopxsWkc7i-qwR9JSiqBNQV7Q_uxTj5DyRlVIj0-XQlbUpmCkAas2NmmWgbZpuiZm2hO8otx6M1;'
      },
      url: `https://shop.48.cn/tickets/item/${ticket}`,
    }, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  });
}
