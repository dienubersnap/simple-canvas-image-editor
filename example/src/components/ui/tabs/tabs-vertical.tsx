/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { Box, Grid, ThemeProvider, createTheme, useTheme } from "@mui/material"
import { Crop, Setting4 } from "iconsax-react"
import AdjustMain from "@src/components/image-editor/adjust"
import TransformMain from "@src/components/image-editor/transform"
import WatermarkMain from "@src/components/image-editor/watermark"
import { CanvasImageEdit } from "../../../../../dist"
import { TabPanelProps } from "./types"

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <Box
      minWidth={50}
      width={180}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
    >
      {value === index && children}
    </Box>
  )
}

interface TabsVerticalComponentProps {
  cvs: CanvasImageEdit | null
}

export default function TabsVerticalComponent(
  props: TabsVerticalComponentProps
) {
  const { cvs } = props
  const theme = useTheme()
  const [value, setValue] = React.useState(0)

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const customTheme = createTheme({
    ...theme,
    components: {
      MuiTab: {
        styleOverrides: {
          root: {
            padding: "0px !important",
            width: "50px !important",
            minWidth: "50px !important",
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={customTheme}>
      <Grid
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        style={{ color: "white" }}
      >
        <Grid item md={9} display="flex" justifyContent="flex-end">
          <CustomTabPanel value={value} index={0}>
            <AdjustMain cvs={cvs} />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <TransformMain />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <WatermarkMain />
          </CustomTabPanel>
        </Grid>

        <Grid item md={3} display="flex" justifyContent="flex-end">
          <Tabs
            orientation="vertical"
            value={value}
            onChange={handleChange}
            aria-label="tabs panel"
            TabIndicatorProps={{
              style: { display: "none" },
              sx: { width: "1px" },
            }}
          >
            <Tab
              icon={
                <Setting4 color={`#${value === 0 ? "FFFFFF" : "8D8D8D"}`} />
              }
              aria-label="setting"
            />
            <Tab
              icon={<Crop color={`#${value === 1 ? "FFFFFF" : "8D8D8D"}`} />}
              aria-label="crop"
            />
            <Tab
              icon={
                <img
                  alt="Logo watermark"
                  src={`/svg/${
                    value === 2 ? "Watermark-White" : "Watermark"
                  }.svg`}
                  width="0"
                  height="0"
                  sizes="100vw"
                  style={{ width: "auto", height: "auto", padding: 10 }}
                />
              }
              aria-label="watermark"
            />
          </Tabs>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}
