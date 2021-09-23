import { padLeft } from '@/utils';
const mixin = {
  filters: {
    formatTime(time) {
      if (!time) return '';
      const date = new Date(Number(time));
      const year = date.getFullYear();
      const month = padLeft(date.getMonth() + 1);
      const day = padLeft(date.getDate());
      const hour = padLeft(date.getHours());
      const minute = padLeft(date.getMinutes());
      const seconds = padLeft(date.getSeconds());
      return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
    }
  },
  computed: {
    ffmpeg() {
      return localStorage.getItem('ffmpeg') || 'ffmpeg';
    }
  }
};

export default mixin;