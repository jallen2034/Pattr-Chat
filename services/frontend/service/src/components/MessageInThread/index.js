import { makeStyles } from '@material-ui/core/styles'
import Avatar from './Avatar'
import MessageMetadata from './MessageMetadata'
import Message from './Message'
import Paper from '@material-ui/core/Paper'

// style MessageInThread component
const useStyles = makeStyles({
  root: {
    minWidth: 275,
    padding: '1rem'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)'
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
})

// MessageinThread component
const MessageInThead = (props) => {
  const classes = useStyles()
  const date = new Date()
  return (
    <Paper className={classes.root}>
      <div>
        <Avatar name='Bob' />
      </div>
      <div>
        <div>
          <MessageMetadata name={props.messageName} date={date} />
        </div>
        <Message>
          {props.messageText}
        </Message>
      </div>
    </Paper>
  )
}

export default MessageInThead
