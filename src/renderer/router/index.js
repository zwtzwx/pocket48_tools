import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'

Vue.use(Router)

function loadOnPath(view) {
  return () => import(/* webpackChunkName: "chunk" */ '@/views/' + view);
}

const Layout = loadOnPath('layout/layout');


export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Layout,
      redirect: '/config',
      children: routes
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
