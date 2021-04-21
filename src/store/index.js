import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
export default new Vuex.Store({
  state: () => ({
    speedTestConfig: null,
    user: undefined
  }),
  getters: {
    speedTestConfig: state => state.speedTestConfig,
    user: state => state.user
  },
  mutations: {
    updateUser: (state, {user}) => {
      Vue.set(state, 'user', user)
    },
    updateSpeedTestConfig: (state, content) => {
      Vue.set(state, 'speedTestConfig', content)
    }
  },
  plugins: [
    createPersistedState({
      getState: (key) => Cookies.getJSON(key),
      setState: (key, state) => Cookies.set(key, state, { expires: 3, secure: true })
    })
  ]
})