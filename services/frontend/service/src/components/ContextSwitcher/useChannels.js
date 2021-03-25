import { useState, useEffect } from 'react'
import { useSubscription } from '@apollo/client'
import { GET_PUBLIC_CHANNELS, GET_PRIVATE_CHANNELS } from './queries'

const useChannels = ({ currentState, setCurrentState, currentUser }) => {
  // grab this hook, which stores the data back from graphql with live data of users current public channels and conversations
  const {
    loading: loadingPublic,
    error: errorPublic,
    data: dataPublic
  } = useSubscription(GET_PUBLIC_CHANNELS, {
    variables: { userId: currentUser.id }
  })

  // grab this hook. stores the data back from graphql with live data of users current private channels & conversations
  const {loading: loadingPrivate, error: errorPrivate, data: dataPrivate} = useSubscription(GET_PRIVATE_CHANNELS, {
    variables: { userId: currentUser.id }
  })
  const error = errorPrivate || errorPublic
  const loading = loadingPrivate || loadingPublic
  const ready = !loading && !error
  const [channels, setChannels] = useState([])
  const [publicConversations, setPublicConversations] = useState([])
  const [privateConversations, setPrivateConversations] = useState([])
  const [currentConversations, setCurrentConversations] = useState([])

  // extracts channels once data is loaded
  useEffect(() => {
    if (ready) {
      setChannels(
        dataPublic.users_by_pk.users_channels.map(({ channel }) => channel)
      )
    }
  }, [ready, setChannels, dataPublic])

  // sets the currently selected channel to be something the user has access to
  useEffect(() => {
    if (ready) {
      setCurrentState((cs) => {
        const mutatedState = { ...cs }
        try {
          if (
            !channels
              .map((channel) => {
                return channel.id
              })
              .includes(mutatedState.channel)
          ) {
            /* if above evals to true, check if that users data.users_by_pk.channels.length is more than 0
             * if it is, then set the mutated states .channel property to = data.users_by_pk.channels[0].id, setting a default channel
             * else this logged in user is removed from the last channel they can see in their list */
            if (channels.length > 0) {
              mutatedState.channel = channels[0].id
            } else {
              mutatedState.channel = null
            }
          }
        } catch {}
        if (cs.channel === mutatedState.channel) {
          return cs
        } else {
          return mutatedState
        }
      })
    }
  }, [ready, setCurrentState, channels])

  // sets all the conversations that the user can access
  useEffect(() => {
    if (ready) {
      setCurrentConversations([...publicConversations, ...privateConversations])
    }
  }, [
    ready,
    publicConversations,
    privateConversations,
    setCurrentConversations
  ])

  // sets the currently selected conversation to be something the user has access to
  useEffect(() => {
    if (ready) {
      setCurrentState((cs) => {
        const mutatedState = { ...cs }
        try {
          /* handle an instance where a user might delete a conversation
           * map through currentConversations array above, on each iteration, return the conversation.id
           * on each passthrough of the loop, ensure the conversation.id is included with the mutatedStates conversation */
          if (
            !currentConversations
              .map((conversation) => {
                return conversation.id
              })
              .includes(mutatedState.conversation)
          ) {
            /* if above evaluates to false, check if they have any valid conversations.
             * setting a default channel - set the first conversation from currentConversations[0].id as the default selected
             * else they don't have any conversations, don't show anything in the sidebar */
            if (currentConversations.length > 0) {
              mutatedState.conversation = currentConversations[0].id
            } else {
              mutatedState.conversation = null
            }
          }
        } catch {}
        if (
          cs.conversation === mutatedState.conversation &&
          cs.channel === mutatedState.channel
        ) {
          return cs
        } else {
          return mutatedState
        }
      })
    }
  }, [setCurrentState, ready, currentConversations])

  // show our conversation for a users selected channel
  useEffect(() => {
    if (ready) {
      try {
        setPrivateConversations(
          dataPrivate.users_by_pk.users_conversations
            .map(({ conversation }) => conversation)
            .filter((conversation) => {
              return conversation.channel_id === currentState.channel
            })
        )
      } catch {
        setPrivateConversations([])
      }
    }
  }, [ready, currentState.channel, dataPrivate])

  // show our conversation for a users selected channel, otherwise user has no conversations in the selected channel
  useEffect(() => {
    if (ready) {
      try {
        setPublicConversations(
          channels.find((channel) => {
            return channel.id === currentState.channel
          }).conversations
        )
      } catch {
        setPublicConversations([])
      }
    }
  }, [ready, currentState.channel, channels])

  return {
    channels,
    publicConversations,
    privateConversations,
    error,
    loading
  }
}

export default useChannels
