<template>
    <div v-if="hasConfig">
        <v-alert
          v-if="error.length != ''"
          border="right"
          colored-border
          type="error"
          elevation="2">
        {{error}}
        </v-alert>
        <v-progress-linear v-if="processing"
        indeterminate
        color="yellow darken-2"></v-progress-linear>
        <div v-if="hasContent">
          <strong>Average of speed</strong>
          <div v-for="item, name in average" :key="name" :value="name">
            <strong>{{ name }}</strong>
            <v-progress-linear
              :value="Math.round(getValueSpeed(item[0].download))"
              :color="colors[0]"
              height="25">
            <template>
              <strong>Download {{ Math.round(getValueSpeed(item[0].download)) }}%</strong>
            </template>
            </v-progress-linear>
            <v-progress-linear
              :value="Math.round(getValueSpeed(item[0].upload))"
              :color="colors[1]"
              height="25">
            <template>
              <strong>Upload {{ Math.round(getValueSpeed(item[0].upload)) }}%</strong>
            </template>
            </v-progress-linear>
          </div>
        </div>
    </div>
</template>
<script>
import {mapGetters} from 'vuex'
import axios from 'axios'
import {log} from "@/scripts/Utils"
export default {
  name: 'Charts',
  props: ['data', 'colors'],
  data() {
    return {
        average: {},
        error: "",
        processing: true,
        polling: null,
    }
  },
  computed: {
    ...mapGetters([
      'speedTestConfig',
      ]),
    hasConfig() {
      return this.speedTestConfig !== null && this.speedTestConfig.length > 0
    },
    hasContent() {
      return this.data !== null && Object.keys(this.average).length > 0
    }
  },
  mounted() {
    this.requestAll()
    this.polling = setInterval(this.requestAll, 15000)
  },
  methods: {
    async requestAll() {
        log("Requesting...")
        this.processing = true
        this.error = ""
        let content = {}
        if (this.hasConfig) {
            let addresses = this.speedTestConfig 
            let errorCount = 0
            let endPointError = " "
            for (let item in addresses) {
            try {
                let name = addresses[item].name
                let url = addresses[item].url + "speed/avg"
                let response = await axios.get(url, {
                headers: {
                    'Access-Control-Allow-Origin' : '*'
                }
                })
                if (response.data.average) {
                  content[name] = response.data.average
                }
            } catch (e) {
                endPointError += addresses[item].name + " "
                errorCount += 1
                this.error = "([" + errorCount + "]"+ endPointError + ") " + e
                log(e)
            }
            }
        }
        if (Object.keys(content)) {
            // Limiting the size
            this.average = content
        }
        this.processing = false
        log("Request completed.")
    },
    getValueSpeed(value) {
      // 200 mb per second
      return (value * 100) / 200
    }
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>