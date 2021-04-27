<template>
  <v-row no-gutters v-if="dataProcessed.overall">
    <v-col>
      <div v-for="item, i in dataProcessed.overall" :key="i" :value="i">
        <h3>Speed network {{item.name}}</h3>
        <line-chart :chart-data="item.speed"></line-chart>
      </div>
    </v-col>
    <v-col>
      <div class="all-center">
        <h3>Speed in general</h3>
        <bar-chart :chart-data="dataProcessed.bars.speed"></bar-chart>
      </div>
      <Status :data="dataProcessed" :colors="colors" />
    </v-col>
  </v-row>
</template>

<script>
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import Status from '@/components/Status'
import dataset from "@/components/charts/collections/dataset"
import {log} from "@/scripts/Utils"
export default {
  name: 'Charts',
  props: ['data'],
  data() {
    return {
      dataProcessed: dataset.collection(),
      error: "",
      processing: true,
      polling: null,
      colors: ['#ffbf00', '#9966cc']
    }
  },
  mounted() {
    this.requestAll()
    this.polling = setInterval(this.requestAll, 15000)
  },
  methods: {
    async requestAll() {
      this.processing = true
      try {
        log("Updating...")
        let overall = this.getDataPerMinute()
        let bars = this.getDataPerNetwork()
        this.dataProcessed = {"overall": overall, "bars": bars}
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
    getDataPerNetwork () {
      log("Getting data per network...")
      let content = dataset.collection()
      let labelDownload = dataset.label()
      let labelUpload = dataset.label()
      content.datasets.push(labelDownload)
      content.datasets.push(labelUpload)
      for (let item in this.data) {
        let points = this.data[item]
        content.labels.push(item)
        labelDownload.label = 'Download'
        labelDownload.backgroundColor = this.colors[0]
        labelUpload.label = 'Upload'
        labelUpload.backgroundColor = this.colors[1]
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
    getDataPerMinute () {
      log("Getting data per minute...")
      let networks = {}
      for (let item in this.data) {
        let points = this.data[item]
        let content = dataset.collection()
        let labelDownload = dataset.label()
        labelDownload.label = 'Download'
        labelDownload.backgroundColor = this.colors[0]
        let labelUpload = dataset.label()
        labelUpload.label = 'Upload'
        labelUpload.backgroundColor = this.colors[1]
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
  },
  components: {
    LineChart,
    BarChart,
    Status
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>
