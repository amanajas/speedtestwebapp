<template>
    <div class="all-center" v-if="hasConfig">
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
      return this.data !== null
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
                if (response.data.speed) {
                    if (response.data.speed.length > 500) {
                        content[name] = response.data.speed.filter(function(item, index) {
                        return index > response.data.speed.length - 100; 
                        })
                    } else {
                        content[name] = response.data.speed
                    }
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
            log(JSON.stringify(this.average))
        }
        this.processing = false
        log("Request completed.")
    }
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>