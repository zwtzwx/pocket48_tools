import { spawn } from 'child_process';

let child;

function download(configData = {}) {
  const { ffmpeg, playStreamPath, filePath, protocolWhiteList } = configData;
  const ffmpegArgs = ['-i', playStreamPath, '-c', 'copy', filePath];
  if (protocolWhiteList) {
    ffmpegArgs.unshift('-protocol_whitelist', 'file,http,https,tcp,tls');
  }
  child = spawn(ffmpeg, ffmpegArgs);
  child.stdout.on('data', data => {
    console.log('data', data);
  });

  child.stderr.on('data', data => {
    // console.log('err', data.toString());
  });

  child.on('close', code => {
    postMessage({ type: 'close' });
  });

  child.on('error', err => {
    postMessage({ type: 'error' });
  });
}

// 中止子进程
function stopChild() {
  console.log('中止进程')
  child.kill('SIGTERM');
}

addEventListener('message', function (e) {
  const { type } = e.data;
  console.log('接收到', type)
  switch(type) {
    case 'start':
      download(e.data);
      break;
    case 'stop':
      stopChild();
      break;
  }
});