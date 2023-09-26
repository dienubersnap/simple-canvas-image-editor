import { TextField, ThemeProvider, createTheme, useTheme } from "@mui/material"
import React from "react"
import { AdjustProps, TextFieldProps } from "../types"

export default function TextFieldComponent(props: TextFieldProps) {
  const theme = useTheme()
  const { name, value } = props
  const [slider, setSlider] = React.useState<number>(
    value[name as keyof AdjustProps]
  )

  // const handleChange = (_event: Event, newValue: number | number[]) => {
  //   if (typeof newValue === "number") {
  //     setSlider(newValue)
  //     onChange(name, newValue)
  //   }
  // }

  const customTheme = createTheme({
    ...theme,
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            padding: 0,
          },
        },
      },
    },
  })

  React.useEffect(() => {
    setSlider(value[name as keyof AdjustProps])
  }, [name, value])

  return (
    <ThemeProvider theme={customTheme}>
      <TextField
        sx={{
          "& fieldset": { border: "none" },
        }}
        size="small"
        inputProps={{
          style: {
            color: "white",
            textAlign: "right",
          },
          readOnly: true,
        }}
        value={slider}
        id={name}
        variant="outlined"
      />
    </ThemeProvider>
  )
}
