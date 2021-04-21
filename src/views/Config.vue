<template>
  <div class="all-center">
    <div v-if="!hasConfig">
      <div v-if="searching">
        <PlaceHolder color="amber" size="50"/>
      </div>
      <div v-else>
        <h6>Set your router IP and click on the button below to search in your network for endpoints.</h6>
        <h4>Press enter when finish</h4>
        <v-alert
          v-if="error.length != ''"
          border="right"
          colored-border
          type="error"
          elevation="2"
        >
          {{error}}
        </v-alert>
        <v-form
          ref="form"
          lazy-validation
          v-on:submit.prevent="search"
        >
          <v-text-field
            v-model="ip"
            :counter="15"
            :rules="[rules.required, rules.counter, rules.ip]"
            label="IP from router"
            maxlength="15"
            required
          ></v-text-field>
          </v-form>
      </div>
    </div>
    <div v-else>

    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import axios from 'axios'
import {log} from "../scripts/Utils"
import PlaceHolder from "../components/PlaceHolder"
export default {
  name: 'home',
  data() {
    return {
      searching: false,
      error: "",
      ip: "",
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
      'user',
      'speedTestConfig'
      ]),
    loggedIn () { return this.user !== null },
    hasConfig() {
      return this.speedTestConfig !== null && this.speedTestConfig.length > 0
    }
  },
  methods: {
    async search () {
      try {
        this.error = ""
        this.searching = true
        let addressNetwork = this.ip.split(".")[0] + "." + this.ip.split(".")[1] + "." + this.ip.split(".")[2]
        for (var count = 101; count < 255; count++) {
          const response = await axios.get("https://" + addressNetwork + "." + count + ":5000");
          log(response)
        }
      } catch (e) {
        this.error = e
        log(e)
      }
      this.searching = false
      return false
    }
  },
  components: {
    PlaceHolder
  }
}
</script>