<template>
  <v-container class="all-center">
    <div v-if="searching">
      <PlaceHolder color="amber" size="50"/>
    </div>
    <div class="margin-space-top" v-else>
      <v-card flat>
        <v-card-text>
          <h6>Select your internet download speed.</h6>
        </v-card-text>
        <div class="text-center">
          <v-slider
            v-model="internetDownloadSpeed"
            min="4"
            max="2000"
            color="orange darken-3"
            append-icon="mdi-plus"
            prepend-icon="mdi-minus"
            @click:append="moreDownloadSpeed"
            @click:prepend="lessDownloadSpeed"
            label="Internet download speed in (mb/s)"
          ></v-slider>
          <v-slider
            v-model="internetUploadSpeed"
            min="4"
            max="2000"
            color="green darken-3"
            append-icon="mdi-plus"
            prepend-icon="mdi-minus"
            @click:append="moreUploadSpeed"
            @click:prepend="lessUploadSpeed"
            label="Internet upload speed in (mb/s)"
          ></v-slider>
          <div>
            <span class="caption text-uppercase">download speed:</span>
            <span class="font-weight-bold">
              {{ internetDownloadSpeed }}Mb/s
            </span>
            ,&nbsp;
            <span class="caption text-uppercase">upload speed:</span>
            <span class="font-weight-bold">
              {{ internetUploadSpeed }}Mb/s
            </span>
          </div>
        </div>
        <v-divider></v-divider>
        <v-card-text>
          <h6>Type your endpoint IP in the field below to connect it.</h6>
        </v-card-text>
        <v-alert
          v-if="error.length != ''"
          border="right"
          colored-border
          type="error"
          elevation="2">
          {{error}}
        </v-alert>
        <v-form
          ref="form"
          lazy-validation
          v-on:submit.prevent="search">
            <v-text-field
              v-model="nameOfEndpoint"
              :counter="50"
              :rules="[rules.required]"
              label="Name of the endpoint"
              maxlength="50"
              required
            ></v-text-field>
            <v-text-field
              v-model="ipOfEndpoint"
              :counter="15"
              :rules="[rules.required, rules.counter, rules.ip]"
              label="IP from endpoint"
              maxlength="15"
              required
            ></v-text-field>
            <v-slider
              v-model="internetAntenaDownloadSpeed"
              min="4"
              max="2000"
              color="orange darken-3"
              append-icon="mdi-plus"
              prepend-icon="mdi-minus"
              @click:append="moreAntenaDownloadSpeed"
              @click:prepend="lessAntenaDownloadSpeed"
              label="Antena download speed in (mb/s)"
            ></v-slider>
            <v-slider
              v-model="internetAntenaUploadSpeed"
              min="4"
              max="2000"
              color="green darken-3"
              append-icon="mdi-plus"
              prepend-icon="mdi-minus"
              @click:append="moreAntenaUploadSpeed"
              @click:prepend="lessAntenaUploadSpeed"
              label="Antena upload speed in (mb/s)"
            ></v-slider>
            <div>
              <span class="caption text-uppercase">download speed:</span>
              <span class="font-weight-bold">
                {{ internetAntenaDownloadSpeed }}Mb/s
              </span>
              ,&nbsp;
              <span class="caption text-uppercase">upload speed:</span>
              <span class="font-weight-bold">
                {{ internetAntenaUploadSpeed }}Mb/s
              </span>
            </div>
            <v-btn
              color="success"
              class="mr-4"
              @click="search">
              Add
            </v-btn>
          </v-form>
        </v-card>
      </div>
    <EndpointList />
  </v-container>
</template>
<script>
import {mapGetters} from 'vuex'
import axios from 'axios'
import {log} from "../scripts/Utils"
import PlaceHolder from "../components/PlaceHolder"
import EndpointList from "../components/EndpointList"
export default {
  name: 'config',
  data() {
    return {
      rating: 2,
      searching: false,
      success: "",
      error: "",
      ipOfEndpoint: "",
      nameOfEndpoint: "",
      internetAntenaDownloadSpeed: 0,
      internetAntenaUploadSpeed: 0,
      rules: {
        required: value => !!value || 'Required.',
        counter: value => value.length <= 15 || 'Max 15 characters',
        ip: value => {
          const pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
          return pattern.test(value) || 'Invalid ip.'
        },
      },
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
    validateForm () {
      return this.$refs.form.validate()
    },
    internetDownloadSpeed: {
      get() {
        return this.maximumDownloadSpeedConfigured
      },
      set(value) {
        this.$store.commit('updateMaximumDownloadSpeedConfigured', value)
      }
    },
    internetUploadSpeed: {
      get() {
        return this.maximumUploadSpeedConfigured
      },
      set(value) {
        this.$store.commit('updateMaximumUploadSpeedConfigured', value)
      }
    }
  },
  mounted() {
    this.internetDownloadSpeed = this.maximumDownloadSpeedConfigured
    this.internetUploadSpeed = this.maximumUploadSpeedConfigured
  },
  methods: {
    moreDownloadSpeed() {
      this.internetDownloadSpeed += 1
    },
    lessDownloadSpeed() {
      this.internetDownloadSpeed -= 1
    },
    moreAntenaDownloadSpeed() {
      this.internetAntenaDownloadSpeed += 1
    },
    lessAntenaDownloadSpeed() {
      this.internetAntenaDownloadSpeed -= 1
    },
    moreUploadSpeed() {
      this.internetUploadSpeed += 1
    },
    lessUploadSpeed() {
      this.internetUploadSpeed -= 1
    },
    moreAntenaUploadSpeed() {
      this.internetAntenaUploadSpeed += 1
    },
    lessAntenaUploadSpeed() {
      this.internetAntenaUploadSpeed -= 1
    },
    async search() {
      log("Looking for endpoint...")
      try {
        this.success = ""
        if (this.validateForm) {
          this.error = ""
          this.searching = true
          let url = "http://" + this.ipOfEndpoint + ":5000/"
          let response = await axios.get(url, {
            headers: {
              'Access-Control-Allow-Origin' : '*'
            }
          })
          log(JSON.stringify(response))
          if (response.data.message == "Everything running :)") {
            // Adding the address in the list
            let addresses = []
            if (this.hasConfig) {
              addresses = this.speedTestConfig
            }
            for (let item in addresses) {
              if (addresses[item].url == url) {
                throw Error("The endpoint " + url + " already exists with the name: " + addresses[item].name)
              }
            }
            addresses.push({
              "name": this.nameOfEndpoint.toUpperCase(), 
              "url": url,
              "download": this.internetAntenaDownloadSpeed,
              "upload": this.internetAntenaUploadSpeed
              })
            this.$store.commit('updateSpeedTestConfig', addresses)
            this.success = "Endpoint " + this.nameOfEndpoint + " added"
          }
        }
      } catch (e) {
        this.error = e
        log("It was not possible to connect to the endpoint: " + e)
      }
      this.nameOfEndpoint = ""
      this.ipOfEndpoint = ""
      this.searching = false
      return false
    }
  },
  components: {
    PlaceHolder,
    EndpointList
  }
}
</script>