<template>
  <v-card light elevation="0" color="amber" class="all-center margin-space-bottom">
    <v-row>
      <v-img
        lazy-src="img/banner_low.png"
        max-height="150"
        max-width="150"
        src="img/banner.png"
        class="banner"
      ></v-img>
    </v-row>
    <v-row v-if="hasLoaded">
        <v-card width="100%">
          <v-btn text :href="link.link" v-for="link in links"
          :key="link.title" :value="link.title" depressed>
            <v-icon>{{ link.icon }}</v-icon>
            <span class="link-title">{{ link.title }}</span>
          </v-btn>
        </v-card>
    </v-row>
    <PlaceHolder v-else color="#666666"/>
  </v-card>
</template>
<script>
import PlaceHolder from "./PlaceHolder"
export default {
  name: 'main-menu',
  data: () => {
      return { 
        links: [
        {"link": "/", "title": "Home", "icon": "mdi-home"}, 
        {"link": "/config", "title": "Configuration", "icon": "mdi-wrench"}],
      }
  },
  computed: {
    hasLoaded() {
      return this.links != undefined && this.links.length > 0
    }
  },
  components: {
    PlaceHolder
  }
}
</script>
<style>
.banner {
  margin-left: 20px;
}
</style>