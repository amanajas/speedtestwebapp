<template>
  <div class="all-center">
    <div v-if="!hasConfig">
       <v-alert
          dense
          outlined
          type="error"
        >
          If you are seeing this is because you did not configured the endpoints.<br>
          Click on configuration option and follow the instructions.<br>
        </v-alert>
    </div>
    <div v-else>
      <v-alert
          v-if="error.length != ''"
          border="right"
          colored-border
          type="error"
          elevation="2">
        {{error}}
       </v-alert>
      <Charts :data="data"/>
    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import axios from 'axios'
import {log} from "../scripts/Utils"
import Charts from "../components/Charts"
export default {
  name: 'home',
  data() {
    return {
      error: "",
      data: []
    }
  },
  computed: {
    ...mapGetters([
      'user',
      'speedTestConfig',
      'speedTestContent'
      ]),
    loggedIn () { return this.user !== null },
    hasConfig() {
      return this.speedTestConfig !== null && this.speedTestConfig.length > 0
    },
    hasContent() {
      return this.speedTestContent !== null && this.speedTestContent.length > 0
    }
  },
  created() {
    this.search()
  },
  methods: {
    async search() {
      this.error = ""
      try {
        if (this.hasConfig) {
          let addresses = this.speedTestConfig 
          for (let item in addresses) {
            let name = addresses[item].name
            let url = addresses[item].url + "speed"
            let response = await axios.get(url, {
              headers: {
                'Access-Control-Allow-Origin' : '*'
              }
            })
            if (response.data.speed) {
              let content = {}
              if (this.hasContent) {
                content = this.speedTestContent
              }
              if (content[name] == undefined) {
                content[name] = response.data.speed
              } else {
                for (item in response.data.speed) {
                  let speed = speed[item]
                  let lastDate = content[name][content[name].length - 1].ts
                  if (speed.ts > lastDate) {
                    content[name].push(speed)
                  }
                }
              }
              this.data = content
              this.$store.commit('updateSpeedTestContent', content)
            }
          }
        }
      } catch (e) {
        this.error = e
        log(e)
      }
    }
  },
  components: {
    Charts
  }
}
</script>