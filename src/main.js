import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import vuetify from '@/plugins/vuetify'

Vue.use(vuetify)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  icons: {
    iconfont: 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
  },
  render: h => h(App),
}).$mount('#app')
