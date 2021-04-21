import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/Home.vue'
import Config from '../views/Config.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '*',
      name: 'home',
      component: Home
    },
    {
      path: '/config',
      name: 'config',
      component: Config
    }
  ]
})

export default router