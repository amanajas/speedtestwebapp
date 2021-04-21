<template>
  <v-footer padless>
    <v-container class="white-background all-center">
      <v-btn text :href="link.link" v-for="link in links"
          :key="link.title" :value="link.title" depressed>
            <v-icon>{{ link.icon }}</v-icon>
          </v-btn>
        <v-divider />
        {{ knowThat }} <br />
            <strong>©{{ new Date().getFullYear() }} &nbsp;Thiago Amanajás</strong>
    </v-container>
  </v-footer>
</template>
<script>
export default {
  name: 'custom-footer',
  data: () => {
      return { 
        links: [
        {"link": "/", "title": "Home", "icon": "mdi-home"}, 
        {"link": "/config", "title": "Configuration", "icon": "mdi-wrench"}],
      }
  },
  props: {
    knowThat: String,
    default: () => {
      return {
        knowThat: ""
      }
    }
  }
}
</script>