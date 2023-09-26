import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { DialogComponentProps } from "./types"

export default function DialogComponent(props: DialogComponentProps) {
  const {
    open,
    title,
    content,
    action,
    handleClose,
    styleDialog,
    styleTitle,
    styleContent,
    styleActions,
  } = props

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      disableScrollLock
      aria-labelledby="responsive-dialog-title"
      PaperProps={{ sx: { borderRadius: "28px", width: 330, ...styleDialog } }}
    >
      <DialogTitle sx={{ textAlign: "center", ...styleTitle }}>
        {title}
      </DialogTitle>

      <DialogContent sx={{ ...styleContent }}>{content}</DialogContent>

      <DialogActions sx={{ mb: 3, ...styleActions }}>{action}</DialogActions>
    </Dialog>
  )
}
