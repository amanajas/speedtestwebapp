<template>
    <v-container v-if="hasConfig">
        <v-progress-linear v-if="processing"
        indeterminate
        color="yellow darken-2"></v-progress-linear>
        <div v-if="hasContent">
          <v-row>
            <v-card style="margin:10px;" flat width="100%">
              <v-card-text>
                <div class="text--primary"><strong>Average of speed based on maximum: {{ maximumSpeedConfigured }}mb/s</strong></div>
                <p> <i>Note:</i> The values don't depend on the date </p>
              </v-card-text>
            </v-card>
          </v-row>
          <v-row>
            <div v-for="item, name, i in average" :key="name" :value="name">
              <v-card style="margin:10px;">
                <v-card-text>
                  <div class="text--primary">{{ name }}</div>
                  <p>{{ speedTestConfig[i].url }}</p>
                  <p class="text--primary">
                    Download <strong>{{Math.round(getValueSpeed(item[0].download))}}mb/s</strong>
                  </p>
                  <p class="text--primary">
                    Upload <strong>{{Math.round(getValueSpeed(item[0].upload))}}mb/s</strong>
                  </p>
                </v-card-text>
              </v-card>
            </div>
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
      'maximumSpeedConfigured'
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
      return (value * 100) / this.maximumSpeedConfigured
    }
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>