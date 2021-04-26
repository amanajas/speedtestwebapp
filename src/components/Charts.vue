<template>
  <v-container class="grey lighten-5">
    <v-row no-gutters  v-if="data">
      <v-col>
        <div v-for="item, i in data" :key="i" :value="i">
          <h3>Overall speed network {{item.name}}</h3>
          <line-chart :chart-data="item.speed"></line-chart>
         </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LineChart from '@/components/charts/LineChart'
export default {
  name: 'Charts',
  props: ['data'],
  components: {
    LineChart
  }
}
</script>
