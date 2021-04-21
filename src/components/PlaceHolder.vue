<template>
    <div class="all-center">
        <v-sheet v-if="type">
            <v-skeleton-loader
                light
                v-bind="attrs"
                :type="type"
            ></v-skeleton-loader>
        </v-sheet>
        <v-progress-circular v-else
            indeterminate
            rotate="0"
            :size="size"
            value="0"
            width="4"
            :color="color">
        </v-progress-circular>
  </div>
</template>
<script>
  export default {
    name: "placeholder",
    props: {
        color: String,
        type: String,
        size: String,
        default() {
          return {
            color: "amber",
            type: "",
            size: "32"
          }
        }
    },
    data: () => ({
      attrs: {
        class: 'mb-6',
        boilerplate: true,
        elevation: 0
      },
    }),
  }
</script>