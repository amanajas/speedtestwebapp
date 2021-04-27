<template>
 <v-row no-gutters v-if="dataProcessed.overall">
      <v-col>
        <div v-for="item, i in dataProcessed.overall" :key="i" :value="i">
          <h3>Speed network {{item.name}}</h3>
          <line-chart :chart-data="item.speed"></line-chart>
         </div>
      </v-col>
      <v-col>
        <h3>Speed in general</h3>
        <bar-chart :chart-data="dataProcessed.bars.speed"></bar-chart>
      </v-col>
    </v-row>
</template>

<script>
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
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
      colors: []
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
        if (this.colors.length == 0) {
          this.colors = this.createColors(this.data)
        }
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
    getDataPerMinute () {
      log("Getting data per minute...")
      let networks = {}
      for (let item in this.data) {
        let points = this.data[item]
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
  },
  components: {
    LineChart,
    BarChart
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>
