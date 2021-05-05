<template>
    <v-container v-if="hasConfig">
        <v-progress-linear v-if="processing"
        indeterminate
        color="yellow darken-2"></v-progress-linear>
        <div v-if="hasContent">
          <v-row>
            <v-card style="margin:10px;" flat width="100%">
              <v-card-text>
                <div class="text--primary">Average of speed based on maximum: <strong>Download {{ maximumDownloadSpeedConfigured }}Mb/s</strong> and <strong> Upload {{ maximumUploadSpeedConfigured }}Mb/s</strong></div>
                <p> <i>Note:</i> The values don't depend on the date </p>
              </v-card-text>
            </v-card>
          </v-row>
          <v-row>
            <v-data-table
              :headers="headers"
              :items="getTableItems()"
              :items-per-page="10"
              class="elevation-1">
              <template v-slot:item.davg="{ item }">
                <v-chip
                  :color="getDownloadColor(item.davg, item.name)"
                  dark>
                  {{ item.davg }}
                </v-chip>
              </template>
              <template v-slot:item.uavg="{ item }">
                <v-chip
                  :color="getUploadColor(item.uavg, item.name)"
                  dark>
                  {{ item.uavg }}
                </v-chip>
              </template>
              <template v-slot:item.mdsr="{ item }">
                <v-chip
                  :color="getCompareDownloadColor(item.mdsr, item.name)"
                  dark>
                  {{ item.mdsr }}
                </v-chip>
              </template>
              <template v-slot:item.musr="{ item }">
                <v-chip
                  :color="getCompareUploadColor(item.musr, item.name)"
                  dark>
                  {{ item.musr }}
                </v-chip>
              </template>
            </v-data-table>
          </v-row>
        </div>
    </v-container>
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
        headers: [
          {
            text: 'Endpoints',
            align: 'start',
            sortable: false,
            value: 'name'
          },
          { text: "Download (Mb/s)", value: "davg"},
          { text: "Upload (Mb/s)", value: "uavg"},
          { text: "M. Download (%)", value: "mdsr"},
          { text: "M. Upload (%)", value: "musr"},
          { text: "A. Download (%)", value: "dsr"},
          { text: "A. Upload (%)", value: "usr"}
        ]
    }
  },
  watch: {
    data() {
      this.requestAll()
    }
  },
  computed: {
    ...mapGetters([
      'speedTestConfig',
      'maximumDownloadSpeedConfigured',
      'maximumUploadSpeedConfigured'
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
    getNumber(value) {
      return value.replace(/\D/g, '')
    },
    getCompareDownloadColor(value) {
      if (this.getNumber(value) < (this.maximumDownloadSpeedConfigured * 0.4)) return 'red'
      else if (this.getNumber(value) < (this.maximumDownloadSpeedConfigured * 0.8)) return 'orange'
      else return 'green'
    },
    getCompareUploadColor(value) {
      if (this.getNumber(value) < (this.maximumDownloadSpeedConfigured * 0.4)) return 'red'
      else if (this.getNumber(value) < (this.maximumDownloadSpeedConfigured * 0.8)) return 'orange'
      else return 'green'
    },
    getDownloadColor(value, name) {
      let index = Object.keys(this.average).indexOf(name)
      let speed = this.speedTestConfig[index].download
      if (this.getNumber(value) < (speed * 0.4)) return 'red'
      else if (this.getNumber(value) < (speed * 0.8)) return 'orange'
      else return 'green'
    },
    getUploadColor(value, name) {
      let index = Object.keys(this.average).indexOf(name)
      let speed = this.speedTestConfig[index].upload
      if (this.getNumber(value) < (speed * 0.4)) return 'red'
      else if (this.getNumber(value) < (speed * 0.8)) return 'orange'
      else return 'green'
    },
    getTableItems() {
      let data = []
      for (let item in this.average) {
        let index = Object.keys(this.average).indexOf(item)
        let name = item
        let downloadAvg = Math.round(this.average[item][0].download) + "Mb/s"
        let uploadAvg = Math.round(this.average[item][0].upload) + "Mb/s"
        let mdsr = Math.round(this.getCompareDownloadValueSpeed(this.average[item][0].download)) + "%"
        let musr = Math.round(this.getCompareDownloadValueSpeed(this.average[item][0].upload)) + "%"
        let dsr = Math.round(this.getUploadValueSpeed(this.average[item][0].download, this.speedTestConfig[index].download)) + "%"
        let usr = Math.round(this.getUploadValueSpeed(this.average[item][0].upload, this.speedTestConfig[index].upload)) + "%"
        data.push({
            "name": name,
            "davg": downloadAvg,
            "uavg": uploadAvg,
            "mdsr": mdsr,
            "musr": musr,
            "dsr": dsr,
            "usr": usr
          })
      }
      return data
    },
    getCompareDownloadValueSpeed(value) {
      // 200 mb per second
      return (value * 100) / this.maximumDownloadSpeedConfigured
    },
    getCompareUploadValueSpeed(value) {
      // 200 mb per second
      return (value * 100) / this.maximumUploadSpeedConfigured
    },
    getDownloadValueSpeed(value, max) {
      // 200 mb per second
      return (value * 100) / max
    },
    getUploadValueSpeed(value, max) {
      // 200 mb per second
      return (value * 100) / max
    }
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>