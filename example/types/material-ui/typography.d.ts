import "@mui/material/styles/createTypography"

declare module "@mui/material/styles" {
  interface TypographyVariants {
    displayLarge: React.CSSProperties
    displayMedium: React.CSSProperties
    displaySmall: React.CSSProperties
    headlineLarge: React.CSSProperties
    headlineMedium: React.CSSProperties
    headlineSmall: React.CSSProperties
    titleLarge: React.CSSProperties
    titleMedium: React.CSSProperties
    titleSmall: React.CSSProperties
    bodyLarge: React.CSSProperties
    bodyMedium: React.CSSProperties
    bodySmall: React.CSSProperties
    buttonLarge: React.CSSProperties
    buttonMedium: React.CSSProperties
    buttonSmall: React.CSSProperties
  }

  // Allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    displayLarge?: React.CSSProperties
    displayMedium?: React.CSSProperties
    displaySmall?: React.CSSProperties
    headlineLarge?: React.CSSProperties
    headlineMedium?: React.CSSProperties
    headlineSmall?: React.CSSProperties
    titleLarge?: React.CSSProperties
    titleMedium?: React.CSSProperties
    titleSmall?: React.CSSProperties
    bodyLarge?: React.CSSProperties
    bodyMedium?: React.CSSProperties
    bodySmall?: React.CSSProperties
    buttonLarge?: React.CSSProperties
    buttonMedium?: React.CSSProperties
    buttonSmall?: React.CSSProperties
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    displayLarge: true
    displayMedium: true
    displaySmall: true
    headlineLarge: true
    headlineMedium: true
    headlineSmall: true
    titleLarge: true
    titleMedium: true
    titleSmall: true
    bodyLarge: true
    bodyMedium: true
    bodySmall: true
    buttonLarge: true
    buttonMedium: true
    buttonSmall: true
  }
}
