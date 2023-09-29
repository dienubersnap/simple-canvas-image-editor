import React, { ReactElement, useEffect } from "react"
import { Box, Grid, Typography } from "@mui/material"
import AccordionComponent from "@src/components/ui/accordion"
import { ItemAdjust, defaultValueAdjust } from "@src/data/constant"
import { CanvasImageEdit } from "../../../../../dist"
import { AdjustProps } from "./types"
import SliderComponent from "./components/slider"
import TextFieldComponent from "./components/textfield"

interface AdjustMainProps {
  cvs: CanvasImageEdit | null
}

export default function AdjustMain(props: AdjustMainProps) {
  const { cvs } = props
  const [value, setValue] = React.useState<AdjustProps>(defaultValueAdjust)

  const onChange = async (name: string, newValue: number) => {
    if (cvs) {
      const canvas = document.getElementById("canvas") as HTMLCanvasElement
      if (canvas) {
        let I = cvs.result
        if (I) {
          // Light

          if (name === "clarity") {
            // eslint-disable-next-line no-alert
            alert("on proggress")
          }
        }
      }
    }

    setValue((pre) => ({
      ...pre,
      [name]: newValue,
    }))
  }

  useEffect(() => {
    if (cvs) {
      const canvas = document.getElementById("canvas") as HTMLCanvasElement
      if (canvas) {
        let I = cvs.result
        if (I) {
          I.brightness(value.brightness)
            .black(value.blacks)
            .contrast(value.blacks)
            .exposure(value.exposure)
            .white(value.whites)
            .shadow(value.shadows)
            .tint(value.tint)
            .temperature(value.temperature)
            .saturationRGB(value.saturation)
            .sharpness(value.sharpness)
            .render(canvas)
        }
      }
    }
  }, [value])

  return (
    <>
      {ItemAdjust.map((item) => {
        let details: ReactElement[] | null = null
        const nameContent = item.title.toLowerCase()

        details = item.content.map((itemContent) => {
          const nameItemContent: number | string =
            itemContent.name.toLowerCase()
          return (
            <Box key={itemContent.name}>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item md={8}>
                  <Typography>{itemContent.name}</Typography>
                </Grid>
                <Grid item md={4}>
                  <TextFieldComponent
                    onChange={onChange}
                    name={nameItemContent}
                    value={value}
                  />
                </Grid>
              </Grid>

              <SliderComponent
                onChange={onChange}
                name={nameItemContent}
                value={value}
              />
            </Box>
          )
        })

        // details.push(<pre>{JSON.stringify(value, null, 2)}</pre>)

        return (
          <AccordionComponent
            key={item.title}
            summary={<Typography variant="titleSmall">{item.title}</Typography>}
            details={details}
            idTagAccordion={nameContent}
          />
        )
      })}
    </>
  )
}
