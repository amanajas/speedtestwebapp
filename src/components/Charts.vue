<template>
  <v-container class="grey lighten-5">
    <v-row no-gutters>
      <v-col>
        <h3>Overall speed</h3>
        <line-chart :chart-data="lineDatacollection"></line-chart>
        <h3>Daily range</h3>
        <bar-chart :chart-data="barDatacollection"></bar-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import defaultCollection from "@/components/charts/defaultCollection"
import {log} from "../scripts/Utils"
export default {
  name: 'Charts',
  props: ['data'],
  data () {
    return {
      // instantiating datacollection with null
      lineDatacollection: defaultCollection,
      barDatacollection: defaultCollection
    }
  },
  methods: {
    getAveragePerDate (points) {
      if (points.length > 0) {
        let perDayAverage = {}
        let lastDate = new Date(0)
        lastDate.setUTCSeconds(points[0].ts)
        lastDate = lastDate.getDate() + '.' + (lastDate.getMonth()+1) + '.' + lastDate.getFullYear()
        perDayAverage[lastDate] = {}
        let download = 0
        let upload = 0
        let count = 0
        for (let point in points) {
          download += points[point].download
          upload += points[point].upload
          count += 1
          let d = new Date(0)
          d.setUTCSeconds(points[point].ts)
          let currentDate = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear()
          perDayAverage[currentDate] = {"download": download / count, "upload": upload / count}
          if (currentDate != lastDate) {
            lastDate = currentDate
          }
        }
        return perDayAverage
      }
      return {}
    },
    getDataPerHour (points) {
      if (points.length > 0) {
        let pointsPerHour = {}
        for (let point in points) {
          let download = points[point].download
          let upload = points[point].upload
          let d = new Date(0)
          d.setUTCSeconds(points[point].ts)
          let currentDateTime = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' - ' + d.getHours() + ':' + d.getMinutes()
          if (!pointsPerHour[currentDateTime]) {
            pointsPerHour[currentDateTime] = []
          }
          pointsPerHour[currentDateTime].push({"download": download, "upload": upload})
        }
        return pointsPerHour
      }
      return {}
    }
  },
  created() {
    let datasets = {}
    for (let item in this.data) {
      let points = this.data[item]
      let averagePerDay = this.getAveragePerDate(points)
      let dataPerHourPerDay = this.getDataPerHour(points)
      if (!datasets[item]) {
        datasets[item] = []
      }
      datasets[item].push({"averagePerDay": averagePerDay, "dataPerHourPerDay": dataPerHourPerDay})
    }
    // TODO: Plot
    /**
    // Data for the y-axis of the chart
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [
        {
          label: 'Data One',
          backgroundColor: '#f87979',
          // Data for the x-axis of the chart
          data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
        }
      ]
    **/
  },
  components: {
    LineChart,
    BarChart
  }
}
</script>
