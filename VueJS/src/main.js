import Vue from 'vue'
import App from './App.vue'

new Vue({
  render: instance => instance(App),
}).$mount('#app')