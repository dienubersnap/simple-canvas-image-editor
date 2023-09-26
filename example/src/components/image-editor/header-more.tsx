import {
  Menu,
  MenuItem,
  ThemeProvider,
  Typography,
  createTheme,
  useTheme,
} from "@mui/material"
import { moreActionButton } from "@src/data/constant"

interface HeaderMoreProps {
  anchorElUser: HTMLElement | null
  closeMenu: () => void
}

export default function HeaderMore(props: HeaderMoreProps) {
  const theme = useTheme()
  const { anchorElUser, closeMenu } = props

  const customTheme = createTheme({
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: "black",
            border: `1px solid ${theme.palette.neutral.neutral75}`,
            borderRadius: "12px",
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={customTheme}>
      <Menu
        id="menu"
        aria-labelledby="button"
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        style={{
          backgroundColor: "black !important",
          margin: "40px 0",
        }}
      >
        {moreActionButton.map((item) => {
          return (
            <MenuItem
              key={item.title}
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log(item.title)
                closeMenu()
              }}
            >
              <Typography
                variant="bodySmall"
                color={theme.palette.neutral.neutral0}
              >
                <img
                  alt={`icon ${item.title}`}
                  src={`/svg/${item.iconImage}`}
                  width={15}
                  height={15}
                  style={{ verticalAlign: "middle" }}
                />{" "}
                {item.title}
              </Typography>
            </MenuItem>
          )
        })}
      </Menu>
    </ThemeProvider>
  )
}
