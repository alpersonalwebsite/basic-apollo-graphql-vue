import Vue from 'vue'
import VueApollo from 'vue-apollo'

import App from './App.vue'
import { apolloClient } from './apollo'

Vue.config.productionTip = false

// vue-apollo is the Vue binding: it puts the client on every component and gives them an
// `apollo` option, so a component declares what data it needs and never touches fetch.
Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

new Vue({
  apolloProvider,
  render: (h) => h(App)
}).$mount('#app')
