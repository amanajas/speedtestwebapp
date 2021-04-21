<template>
  <v-app>
    <v-main>
      <v-responsive id="home" class="white-background full-height">
        <v-container>
          <MainMenu />
          <v-container>
            <router-view />
          </v-container>
          <CustomFooter
          knowThat="If any data is collected, it will not and shall not play a part in any other activity, but metrics analysis only." />
        </v-container>
      </v-responsive>
    </v-main>
  </v-app>
</template>

<script>
import CustomFooter from './components/Footer'
import MainMenu from './components/MainMenu'
export default {
  name: 'app',
  components: {
    CustomFooter,
    MainMenu,
  }
}
</script>