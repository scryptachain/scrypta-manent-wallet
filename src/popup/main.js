import Vue from 'vue'
import App from './App.vue'
import router from '../router'
import store from '../store'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import '../assets/style.scss'
import VueI18n from 'vue-i18n'
import Clipboard from 'v-clipboard'
import Gravatar from '../components/Gravatar.vue';

Vue.component('v-gravatar', Gravatar);
Vue.use(Clipboard)
Vue.use(VueI18n)
Vue.use(Buefy)
Vue.config.productionTip = false

const messages = {
  en: require('../locales/en.json'),
  it: require('../locales/it.json')
}

const i18n = new VueI18n({
  locale: 'en',
  messages
})

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
