<template>
  <v-container class="all-center">
    <v-row>
      <v-alert
        v-if="!hasConfig"
        dense
        outlined
        type="error">
        If you are seeing this is because you did not configured the endpoints.<br>
        Click on configuration option and follow the instructions.<br>
      </v-alert>
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
    </v-row>
    <v-row>
      <v-menu
        v-if="hasContent"
        :close-on-content-click="true"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="auto">
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="dateFormated"
            label="Date"
            hint="DD.MM.YYYY format"
            persistent-hint
            prepend-icon="mdi-calendar"
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="date"
          no-title
        ></v-date-picker>
      </v-menu>
    </v-row>
    <v-row>
      <Charts :data="data" v-if="hasContent"/>
    </v-row>
  </v-container>
</template>
<script>
import {mapGetters} from 'vuex'
import axios from 'axios'
import {log} from "@/scripts/Utils"
import Charts from "@/components/Charts"
import dateformat from 'dateformat'
export default {
  name: 'home',
  data() {
    return {
      error: "",
      data: null,
      processing: true,
      polling: null,
      currentDate: null,
      currentDateFormated: null
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
    },
    date: {
      get() {
        return this.currentDate
      },
      set(value) {
        this.currentDate = value
        this.dateFormated = value
      }
    },
    dateFormated: {
      get() {
        return this.currentDateFormated
      },
      set(value) {
        this.currentDateFormated = dateformat(value, "dd.mm.yyyy")
      }
    }
  },
  mounted() {
    this.date = dateformat(new Date(), "yyyy-mm-dd")
    this.dateFormated = this.date
    this.requestAll()
    this.polling = setInterval(this.requestAll, 15000)
  },
  methods: {
    async requestAll() {
      this.processing = true
      try {
        log("[Refresh]")
        await this.search()
        this.processing = false
      } catch(e) {
        log(e)
      }
    },
    async search() {
      log("Searching...")
      let content = {}
      let catchError = ""
      if (this.hasConfig) {
        let addresses = this.speedTestConfig 
        let errorCount = 0
        let endPointError = " "
        for (let item in addresses) {
          try {
            let name = addresses[item].name
            let url = addresses[item].url + "speed/" + this.currentDateFormated
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
            catchError = "([" + errorCount + "]"+ endPointError + ") " + e
            log(e)
          }
        }
      }
      if (Object.keys(content)) {
        // Limiting the size
        this.data = content
      }
      this.error = catchError
      log("Search completed.")
    }
  },
  watch: {
    date () {
      this.requestAll()
    },
  },
  components: {
    Charts,
  },
  beforeDestroy () {
    clearInterval(this.polling)
  }
}
</script>