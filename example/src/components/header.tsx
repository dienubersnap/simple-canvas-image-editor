import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material"
import React from "react"
import { ArrowBack, MoreHoriz } from "@mui/icons-material"
import { Back, ArrowForward } from "iconsax-react"
import HeaderMore from "./image-editor/header-more"

export default function Header() {
  const theme = useTheme()
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  )

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  return (
    <AppBar
      position="static"
      style={{
        backgroundColor: theme.palette.neutral.neutral200,
      }}
    >
      <Toolbar disableGutters>
        <Box sx={{ flexGrow: 1, display: "flex" }}>
          <Tooltip title="Back">
            <IconButton sx={{ px: 0.5 }}>
              <ArrowBack htmlColor={theme.palette.neutral.neutral0} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          <Tooltip title="Undo">
            <IconButton sx={{ px: 0.5 }}>
              <Back color={theme.palette.neutral.neutral0} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Redo">
            <IconButton sx={{ px: 0.5 }}>
              <ArrowForward color={theme.palette.neutral.neutral0} />
            </IconButton>
          </Tooltip>

          <Tooltip title="">
            <IconButton sx={{ px: 0.5 }}>
              <Typography color={theme.palette.neutral.neutral0}>
                Save
              </Typography>
            </IconButton>
          </Tooltip>

          <Tooltip title="More">
            <IconButton onClick={handleOpenUserMenu} sx={{ px: 0.5 }}>
              <MoreHoriz htmlColor={theme.palette.neutral.neutral0} />
            </IconButton>
          </Tooltip>

          <HeaderMore
            anchorElUser={anchorElUser}
            closeMenu={handleCloseUserMenu}
          />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
