<template>
    <el-button class="undo-button" @click="undoLastChange">{{ buttonLabel }}</el-button>
  </template>
  
  <script>
  export default {
    inject: {
      dmx: 'dmx',
      http: 'axios',
      Vue: 'Vue'
    },
    computed: {
      buttonLabel() {
        return 'Undo';
      }
    },
    methods: {
      undoLastChange() {
        console.log('Undo button clicked');
        this.$store.dispatch('undo/undoAction');
      }
    },
    created() {
      this.http.get('/core/topic/0').then(response => {
        console.log(new this.dmx.Topic(response.data));
      });
      this.Vue.nextTick(() => {
        console.log('Hello Vue!');
      });
    }
  }
  </script>
  
  <style scoped>
  .undo-button {
    margin-left: 2em;
  }
  </style>
  