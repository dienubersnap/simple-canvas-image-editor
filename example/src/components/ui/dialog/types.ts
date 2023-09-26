import { CSSProperties, ReactNode } from "react"

export interface DialogComponentProps {
  open: boolean
  handleClose: () => void
  title: ReactNode
  content: ReactNode
  action: ReactNode
  styleDialog?: CSSProperties
  styleTitle?: CSSProperties
  styleContent?: CSSProperties
  styleActions?: CSSProperties
}
