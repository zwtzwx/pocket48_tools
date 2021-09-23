import * as fs from 'fs';
import request from 'request';
import { promisify } from 'util';
import { pipeline } from 'stream';

const pipelineP = (readStream, writeStream) => promisify(pipeline);

export function requestDownloadFileByStream(url, path) {
  let totalSize = 0;
  let receivedSize = 0;
  return new Promise((resolve, reject) => {
    request
      .get(url)
      // .on('response', function (data) {
      //   totalSize = Number.parseInt(data.headers['content-length']);
      // })
      // .on('data', function(chunk) {
      //   receivedSize += chunk.length;
      //   showProgress(receivedSize, totalSize);
      // })
      .on('error', function (err) {
        reject(err);
      })
      .on('end', function() {
        resolve();
      })
      .pipe(fs.createWriteStream(path));
  })
}

export function exportExcelFile(buffer, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, buffer, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function showProgress(receied, total) {
  let percentage = (receied * 100) / total;
  console.log('percentage', percentage);
}
