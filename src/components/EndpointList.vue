<template>
    <div class="all-center">
        <v-container class="white-background all-center">
            <v-dialog
                v-model="endpointDeleteAlert"
                persistent
                max-width="290"
                >
                <v-card>
                    <v-card-title class="headline">
                    Do you want to delete this endpoint?
                    </v-card-title>
                    <v-card-text>Deleting this endpoint will result in remove the request for getting the data from the device.</v-card-text>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="disagreeToDeleteEndpoint"
                    >
                        NOT delete
                    </v-btn>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="agreeToDeleteEndpoint"
                    >
                        Go ahead
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <h5 v-if="hasConfig">Endpoints registered:</h5>
            <v-btn text @click="deleteEndpoint(link)" v-for="link in speedTestConfig"
                :key="link.url" :value="link.name" depressed style="margin:10px; padding:50px;">
                  <table>
                    <tr>
                      <td><strong>{{ link.name }}</strong>: {{ link.url }}</td>
                    </tr>
                    <tr>
                      <td>Download: <strong>{{ link.download }}Mb/s</strong></td>
                    </tr>
                    <tr>
                      <td>Upload: <strong>{{ link.upload }}Mb/s</strong></td>
                    </tr>
                  </table>
                  <v-icon>mdi-close-circle</v-icon>
                <v-divider />
            </v-btn>
        </v-container>
    </div>
</template>
<script>
import {log} from "../scripts/Utils"
import {mapGetters} from 'vuex'
export default {
  name: 'endpointlist',
  data() {
    return {
      endpointlist:[],
      endpointDeleteAlert: false,
      endpointToDelete: null
    }
  },
  computed: {
    ...mapGetters([
      'speedTestConfig'
      ]),
    hasConfig() {
      return this.speedTestConfig !== null && this.speedTestConfig.length > 0
    }
  },
  methods: {
      deleteEndpoint(link) {
        this.endpointDeleteAlert = true
        this.endpointToDelete = {"name": link.name, "url": link.url}
        log(JSON.stringify(this.endpointToDelete))
      },
      agreeToDeleteEndpoint() {
        let list = this.speedTestConfig
        let index = -1
        for (let item in list) {
            if (list[item].name == this.endpointToDelete.name && list[item].url == this.endpointToDelete.url) {
                index = item
                break
            }
        }
        if (index > -1) list.splice(index, 1)
        this.$store.commit('updateSpeedTestConfig', list)
        this.endpointDeleteAlert = false
      },
      disagreeToDeleteEndpoint() {
        this.endpointDeleteAlert = false
      }
  }
}
</script>