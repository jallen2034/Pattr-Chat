import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import PersonIcon from '@material-ui/icons/Person'
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import { blue } from '@material-ui/core/colors'
import { gql, useQuery, useMutation } from '@apollo/client'

/* step 1
 * first query to find all users in a channel
 * this needs to refer to currentStates .users elected channel to show the user all users ONLY in the currently selected organization
 * they can add to the desired conversation */
const GET_USERS_IN_CHANNEL = gql`
query ($channelId: Int!, $conversationId: Int!) {
  users_channels(where: {channels_id: {_eq: $channelId}, _and: {_not: {user: {users_conversations: {conversation_id: {_eq: $conversationId}}}}}}) {
    user {
      display_name
      id
    }
  }
}
`

/* step 2
 * second mutator to use currentState.conversation and currentState.conversation to add user to the specific conversation selected.
 * this needs to refer to currentStates .users elected conversation to update the selected user into */
const ADD_USERS_TO_CONVERSATION = gql`
  mutation($userId: Int!, $conversationId: Int!) {
    insert_users_conversations_one(object: {user_id: $userId, conversation_id: $conversationId}) {
      id
    }
  }
`

// appling styles to component
const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600]
  },
  button: {
    height: '32px',
    width: '56px'
  }
})
// simple dialog component to render the user click options
function SimpleDialog ({ onClose, selectedValue, open, usersForChats, currentState, refetch }) {
  // declare our useMutation to add users to conversations here, pass the setter down later
  const [addUserConversation] = useMutation(ADD_USERS_TO_CONVERSATION)

  const classes = useStyles()

  const handleClose = () => {
    onClose(selectedValue)
  }

  // helper function to handle a user click and add a person to a conversation
  const handleListItemClick = (userId, currentState, addUserConversation) => {
    // call addUserConversation adding the current conversation selected in state to the
    addUserConversation({
      variables: {
        userId: userId,
        conversationId: currentState.conversation
      }
    }).then(() => refetch())

    onClose(userId)
  }

  // jsx returned from SimpleDialog component
  return (
    <Dialog onClose={handleClose} aria-labelledby='simple-dialog-title' open={open}>
      <DialogTitle id='simple-dialog-title'>Add user</DialogTitle>
      <List>
        {usersForChats.map((user) => (
          <ListItem button onClick={() => handleListItemClick(user.user.id, currentState, addUserConversation)} key={user.user.id}>
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={user.user.display_name} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
}

// exportour UserSelector component
export default function UserSelector ({ currentState }) {
  const classes = useStyles()
  const usersForChats = []

  // usestate in this component that
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = useState('')

  // grab this hook, which stores the data back from graphql with users that are in the users orginzation
  const { loading, error, data, refetch } = useQuery(GET_USERS_IN_CHANNEL, {
    variables: { channelId: currentState.channel, conversationId: currentState.conversation }
  })
  console.table({ channelId: currentState.channel, conversationId: currentState.conversation, data })
  // useEffect in this component that should only fire off whenever data changes and comes back from
  // out graphQL db
  if (!loading && !error) {
    data.users_channels.map((user) => {
      return usersForChats.push(user)
    })
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = (value) => {
    setOpen(false)
    setSelectedValue(value)
  }

  return (
    <>
      {/* <Typography variant="subtitle1">Selected: {selectedValue}</Typography> */}
      <br />
      <Button onClick={handleClickOpen} className={classes.button}>
        <PersonAddIcon />
      </Button>
      <SimpleDialog
        usersForChats={usersForChats}
        refetch={refetch}
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
        currentState={currentState}
      />
    </>
  )
}
