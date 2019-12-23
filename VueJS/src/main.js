import Vue from 'vue'
import App from './App.vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { GLOBAL_AUTH_TOKEN } from './settings.js'

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(GLOBAL_AUTH_TOKEN)
  operation.setContext({
    headers: {
      authorization: token ? `${token}` : null
    }
  })

  return forward(operation)
});

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/',
});

const apolloClient = new ApolloClient({
  link: authMiddleware.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true
})

Vue.use(VueApollo);

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
});

new Vue({
  el: '#app',
  apolloProvider,
  render: instance => instance(App),
});