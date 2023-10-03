import { Box, Container, Grid, useTheme } from "@mui/material"
import Header from "@src/components/header"
import { useEffect, useState } from "react"
import { CanvasImageEdit } from "../../../../dist"
import TabsVerticalComponent from "../ui/tabs/tabs-vertical"

export default function ImageEditor() {
  const [canvasImage, setCanvasImage] = useState<CanvasImageEdit | null>(null)
  useEffect(() => {
    const loader = new CanvasImageEdit("/img10.jpg")
    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    loader.ImageLoader(canvas)
    loader.result?.render(canvas)

    setCanvasImage(loader)
  }, [])

  const theme = useTheme()
  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.palette.neutral.neutral200,
      }}
    >
      <Container>
        <Header />

        <Grid container>
          <Grid item md={9}>
            <canvas id="canvas" style={{ width: "100%", height: "auto" }} />
          </Grid>
          <Grid item md={3}>
            <TabsVerticalComponent cvs={canvasImage} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
