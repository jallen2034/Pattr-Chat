import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { WebSocketLink } from '@apollo/client/link/ws'
import {
  split,
  HttpLink,
  ApolloClient,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'

// import { setContext } from '@apollo/client/link/context';

/* https://github.com/hasura/nodejs-graphql-subscriptions-boilerplate/issues/3
 * establishing urls to graphql from react for http & (full duplex) web sockets */
const HTTPS_URL = `https${process.env.REACT_APP_GRAPHQL_URL}`
const WSS_URL = `wss${process.env.REACT_APP_GRAPHQL_URL}`

// provides parameters for react to establish a http link to graphql
const httpsLink = new HttpLink({
  uri: HTTPS_URL,
  headers: {
    'x-hasura-admin-secret': process.env.REACT_APP_ADMIN_SECRET
  }
})

// provides parameters for react to establish a full duplex web socket link to graphql
const wssLink = new WebSocketLink({
  uri: WSS_URL,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        'x-hasura-admin-secret': process.env.REACT_APP_ADMIN_SECRET
      }
    }
  }
})

// splitter that decides if a link being made will be http or a web socket link
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wssLink,
  httpsLink
)

// establishes/declares apollo client in our react app
const createApolloClient = () => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link
  })
}

// creates apollo client in our react app
const client = createApolloClient()

function AppContext ({ children }) {
  return (
    <ApolloProvider client={client}>
      <CssBaseline />
      {children}
      <div>
        <ToastContainer position='bottom-center' />
      </div>
    </ApolloProvider>
  )
}

export default AppContext
