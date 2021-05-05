import VuexPersist from 'vuex-persist';
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const vuexLocalStorage = new VuexPersist({
  key: 'speedtest', // The key to store the state on in the storage provider.
  storage: window.localStorage, // or window.sessionStorage or localForage
  // Function that passes the state and returns the state with only the objects you want to store.
  // reducer: state => state,
  // Function that passes a mutation and lets you decide if it should update the state in localStorage.
  // filter: mutation => (true)
})

export default new Vuex.Store({
  state: () => ({
    speedTestConfig: null,
    maximumDownloadSpeedConfigured: 200,
    maximumUploadSpeedConfigured: 80
  }),
  getters: {
    speedTestConfig: state => state.speedTestConfig,
    maximumDownloadSpeedConfigured: state => state.maximumDownloadSpeedConfigured,
    maximumUploadSpeedConfigured: state => state.maximumUploadSpeedConfigured
  },
  mutations: {
    updateSpeedTestConfig: (state, content) => {
      Vue.set(state, 'speedTestConfig', content)
    },
    updateMaximumDownloadSpeedConfigured: (state, content) => {
      Vue.set(state, 'maximumDownloadSpeedConfigured', content)
    },
    updateMaximumUploadSpeedConfigured: (state, content) => {
      Vue.set(state, 'maximumUploadSpeedConfigured', content)
    }
  },
  plugins: [vuexLocalStorage.plugin]
})