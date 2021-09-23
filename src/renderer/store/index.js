import Vue from 'vue'
import Vuex from 'vuex'
import { createPersistedState, createSharedMutations } from 'vuex-electron'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ffmpegLink: '',
    recordVideoList: [], // 录播列表
    liveVideoList: [], // 直播列表
  },
  getters: {
    totalNum(state) {
      return state.num++
    }
  },
  actions: {
    saveFFmpeg({commit}, data) {
      // commit('saveFFmpeg', data)
      console.log(localStorage.getItem('ffmpeg'), 'li')
    },
    setRecordVideoList({commit}, data) {
      commit('setRecordVideoList', data);
    },
    deleteItemInRecordVideoList({commit}, id) {
      commit('deleteItemInRecordVideoList', id);
    },
    setLiveVideoList({commit}, data) {
      commit('setLiveVideoList', data);
    },
    deleteItemInLiveVideoList({commit}, id) {
      commit('deleteItemInLiveVideoList', id);
    },
  },
  mutations: {
    setRecordVideoList(state, data) {
      state.recordVideoList.push(data);
    },
    deleteItemInRecordVideoList(state, id) {
      let index = -1;
      state.recordVideoList.forEach((item,idx) => {
        if (item.id === id) {
          index = idx;
        }
      });
      if (index !== -1) {
        state.recordVideoList.splice(index, 1);
      }
    },
    setLiveVideoList(state, data) {
      state.liveVideoList.push(data);
    },
    deleteItemInLiveVideoList(state, id) {
      let index = -1;
      state.liveVideoList.forEach((item,idx) => {
        if (item.id === id) {
          index = idx;
        }
      });
      if (index !== -1) {
        state.liveVideoList.splice(index, 1);
      }
    },
  },
  plugins: [
    // createPersistedState(),
    // createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
