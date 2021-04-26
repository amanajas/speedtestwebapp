<template>
  <v-container class="grey lighten-5">
    <v-row no-gutters  v-if="data">
      <v-col>
        <div v-for="item, i in data.overall" :key="i" :value="i">
          <h3>Speed network {{item.name}}</h3>
          <line-chart :chart-data="item.speed"></line-chart>
         </div>
      </v-col>
      <v-col>
        <h3>Speed in general</h3>
        <bar-chart :chart-data="data.bars.speed"></bar-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
export default {
  name: 'Charts',
  props: ['data'],
  components: {
    LineChart,
    BarChart
  }
}
</script>
