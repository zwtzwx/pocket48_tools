import Vue from 'vue';
import apis from '@/request';
import shopApi from '@/request/test';
import App from './App';
import router from './router';
import store from './store';
import { Button, message, Icon, Modal, Table } from 'ant-design-vue';
import './styles/common.scss';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;
Vue.prototype.$api = apis;
Vue.prototype.$shopApi = shopApi;
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.$sourceUrl = 'https://source.48.cn';
Vue.prototype.$message = message;

Vue.use(Button);
Vue.use(Icon);
Vue.use(Table);
Vue.use(Modal);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
