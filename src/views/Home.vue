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
      <v-progress-linear v-if="processing"
        indeterminate
        color="yellow darken-2"></v-progress-linear>
      <Charts :data="data" v-if="hasContent"/>
    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import axios from 'axios'
import {log} from "@/scripts/Utils"
import Charts from "@/components/Charts"
import dataset from "@/components/charts/collections/dataset"
export default {
  name: 'home',
  data() {
    return {
      error: "",
      data: null,
      processing: true,
      polling: null,
      colors: []
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
      return this.data !== null
    }
  },
  mounted() {
    this.requestAll()
    this.polling = setInterval(this.requestAll, 15000)
  },
  methods: {
    async requestAll() {
      log("Content mounted")
      this.processing = true
      try {
        log("Updating...")
        let speedTestContent = await this.search()
        if (this.colors.length == 0) {
          this.colors = this.createColors(speedTestContent)
        }
        let overall = this.getDataPerMinute(speedTestContent)
        let bars = this.getDataPerNetwork(speedTestContent)
        this.data = {"overall": overall, "bars": bars}
        this.processing = false
      } catch(e) {
        log(e)
      }
    },
    getNumberZero(n){
      return n < 10 ? "0" + n : n
    },
    getTSDateTime (ts) {
      let d = new Date(0)
      d.setUTCSeconds(ts)
      return d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' - ' + this.getNumberZero(d.getHours()) + ':' + this.getNumberZero(d.getMinutes())
    },
    getTSDate (ts) {
      let d = new Date(0)
      d.setUTCSeconds(ts)
      return d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear()
    },
    getNow() {
      let d = new Date()
      return d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear()
    },
    getRandomColor(strcolors=undefined) {
      let color = '#'
      for (let i = 0; i < 6; i++){
          const random = Math.random()
          const bit = (random * 16) | 0
          color += (bit).toString(16)
      }
      return strcolors.includes(color) ? this.getRandomColor(strcolors) : color
    },
    createColors(items) {
      let colors = {}
      let strcolors = ""
      for (let item in items) {
        let color1 = this.getRandomColor(strcolors)
        strcolors += color1
        let color2 = this.getRandomColor(strcolors)
        strcolors += color2
        colors[item] = [color1, color2]
      }
      return colors
    },
    getDataPerNetwork (speedTestContent) {
      log("Getting data per network...")
      let content = dataset.collection()
      let labelDownload = dataset.label()
      let labelUpload = dataset.label()
      content.datasets.push(labelDownload)
      content.datasets.push(labelUpload)
      for (let item in speedTestContent) {
        let points = speedTestContent[item]
        content.labels.push(item)
        labelDownload.label = 'Download (' + item + ")"
        labelDownload.backgroundColor = this.colors[item][0]
        labelUpload.label = 'Upload (' + item + ")"
        labelUpload.backgroundColor = this.colors[item][1]
        let maxDownload = 0
        let maxUpload = 0
        if (points.length > 0) {
          for (let point in points) {
            if (points[point].download > maxDownload) maxDownload = points[point].download
            if (points[point].upload > maxUpload) maxUpload = points[point].upload
          }
          labelDownload.data.push(maxDownload)
          labelUpload.data.push(maxUpload)
        }
      }
      log("Getting data per network completed.")
      return {"speed": content}
    },
    getDataPerMinute (speedTestContent) {
      log("Getting data per minute...")
      let networks = {}
      for (let item in speedTestContent) {
        let points = speedTestContent[item]
        let content = dataset.collection()
        let labelDownload = dataset.label()
        labelDownload.label = 'Download'
        labelDownload.backgroundColor = '#ffbf00'
        let labelUpload = dataset.label()
        labelUpload.label = 'Upload'
        labelUpload.backgroundColor = '#9966cc'
        content.datasets.push(labelDownload)
        content.datasets.push(labelUpload)
        if (points.length > 0) {
          let lastDateTime = this.getTSDateTime(points[0].ts)
          content.labels.push(lastDateTime.split(" - ")[1])
          for (let point in points) {
            let currentDateTime = this.getTSDateTime(points[point].ts)
            if (lastDateTime != currentDateTime) {
              content.labels.push(currentDateTime.split(" - ")[1])
              lastDateTime = currentDateTime
            }
            labelDownload.data.push(points[point].download)
            labelUpload.data.push(points[point].upload)
          } 
        }
        networks[item] = {"name": item, "speed": content}
      }
      log("Getting data per minute completed.")
      return networks
    },
    async search() {
      log("Searching...")
      let speedTestContent = {}
      this.error = ""
      try {
        if (this.hasConfig) {
          let addresses = this.speedTestConfig 
          let content = {}
          for (let item in addresses) {
            let name = addresses[item].name
            let url = addresses[item].url + "speed"
            let response = await axios.get(url, {
              headers: {
                'Access-Control-Allow-Origin' : '*'
              }
            })
            if (response.data.speed) {
              if (response.data.speed.length > 500) {
                content[name] = response.data.speed.filter(function(item, index) {
                  return index > response.data.speed.length - 100; 
                })
              } else {
                content[name] = response.data.speed
              }
            }
          }
          if (Object.keys(content)) {
            // Limiting the size
            speedTestContent = content
          }
        }
      } catch (e) {
        this.error = e
        log(e)
      }
      log("Search completed.")
      return speedTestContent
    }
  },
  components: {
    Charts,
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>