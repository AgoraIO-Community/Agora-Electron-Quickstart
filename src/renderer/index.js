import Vue from "vue";
import 'bulma/css/bulma.css';
import App from './App.vue';
import './index.css'

Vue.config.productionTip = false
Vue.config.devtools = process.env.NODE_ENV === "development"

new Vue({
  render: h => h(App)
}).$mount('#app')