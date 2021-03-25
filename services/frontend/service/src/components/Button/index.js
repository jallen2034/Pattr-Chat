// eslint-disable-line import/no-named-default
import { default as MaterialButton } from '@material-ui/core/Button'

function Button ({ color = 'primary', variant = 'contained', children }) {
  return (
    <>
      <MaterialButton variant={variant} color={color}>
        {children}
      </MaterialButton>
    </>
  )
}

// export default Button component we declared above
export default Button
