import { createTheme } from "@mui/material"

const theme = createTheme({
  palette: {
    accent: {
      base: "#0180F7",
      dark1: "#0055BB",
      dark2: "#003575",
      light1: "#DDEFFF",
      light2: "#DDEFFF",
    },
    danger: {
      base: "#D92037",
      dark1: "#920606",
      dark2: "#3A0000",
      light1: "#FFECEC",
      light2: "#FFF9F9",
    },
    neutral: {
      white: "#FFF",
      neutral0: "#FFFFFF",
      neutral10: "#F9F9F9",
      neutral25: "#DBDBDB",
      neutral50: "#8D8D8D",
      neutral75: "#575757",
      neutral100: "#0A0A1C",
      neutral200: "#000000",
    },
    primary: {
      main: "#00DEC7",
      base: "#00DEC7",
      light1: "#B7FFF8",
      light2: "#E3FFFC",
      light3: "#F4FFFE",
      light4: "#F6FFFE",
      dark1: "#00A99F",
      dark2: "#093731",
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
    displayLarge: {
      fontWeight: 500,
      fontSize: "57px",
      lineHeight: "64px",
    },
    displayMedium: {
      fontWeight: 500,
      fontSize: "45px",
      lineHeight: "52px",
    },
    displaySmall: {
      fontWeight: 500,
      fontSize: "36px",
      lineHeight: "44px",
    },
    headlineLarge: {
      fontWeight: 500,
      fontSize: "32px",
      lineHeight: "40px",
    },
    headlineMedium: {
      fontWeight: 400,
      fontSize: "28px",
      lineHeight: "36px",
    },
    headlineSmall: {
      fontWeight: 600,
      fontSize: "24px",
      lineHeight: "32px",
    },
    titleLarge: {
      fontWeight: 400,
      fontSize: "22px",
      lineHeight: "28px",
    },
    titleMedium: {
      fontWeight: 500,
      fontSize: "16px",
      lineHeight: "24px",
      letterSpacing: "0.15px",
    },
    titleSmall: {
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0.1px",
    },
    bodyLarge: {
      fontWeight: 400,
      fontSize: "16px",
      lineHeight: "24px",
      letterSpacing: "0.5px",
    },
    bodyMedium: {
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0.25px",
    },
    bodySmall: {
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0.4px",
    },
    buttonLarge: {
      fontWeight: 500,
      fontSize: "16px",
      lineHeight: "24px",
      letterSpacing: "0.1px",
    },
    buttonMedium: {
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0.1px",
    },
    buttonSmall: {
      fontWeight: 500,
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0.1px",
    },
  },
})

export default theme
