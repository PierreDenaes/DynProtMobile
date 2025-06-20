declare module 'react-native-vector-icons/MaterialIcons' {
  import { Icon } from 'react-native-vector-icons/Icon'
  export default Icon
}

declare module 'react-native-vector-icons/Ionicons' {
  import { Icon } from 'react-native-vector-icons/Icon'
  export default Icon
}

declare module 'react-native-vector-icons/Icon' {
  import { Component } from 'react'
  import { TextProps } from 'react-native'

  export interface IconProps extends TextProps {
    name: string
    size?: number
    color?: string
  }

  export class Icon extends Component<IconProps> {}
}
