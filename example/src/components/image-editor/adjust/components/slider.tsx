import { Slider } from "@mui/material"
import React from "react"
import { AdjustProps, SliderProps } from "../types"

export default function SliderComponent(props: SliderProps) {
  const { onChange, name, value } = props
  const [slider, setSlider] = React.useState<number>(
    value[name as keyof AdjustProps]
  )

  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setSlider(newValue)
      onChange(name, newValue)
    }
  }

  return (
    <Slider
      min={-100}
      max={100}
      step={1}
      aria-labelledby="negative-slider"
      name={name}
      value={slider}
      onChange={handleChange}
    />
  )
}
