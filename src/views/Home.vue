<template>
  <div class="all-center">
    <div v-if="!hasConfig">
       <v-alert
          dense
          outlined
          type="error"
        >
          If you are seeing this is because you <strong>did not configured</strong> the <strong>endpoints</strong>.<br>
          Click on <strong>configuration</strong> option and follow the <strong>instructions</strong>.<br>
        </v-alert>
    </div>
    <div v-else>
      <Charts />
    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import Charts from "../components/Charts"
export default {
  name: 'home',
  data() {
    return {
      "searching": false
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
    search () {
      this.searching = true
    }
  },
  components: {
    Charts
  }
}
</script>