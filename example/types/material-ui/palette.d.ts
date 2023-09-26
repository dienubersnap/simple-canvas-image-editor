import "@mui/material/styles/createPalette"

declare module "@mui/material/styles" {
  // Palette
  interface Palette {
    accent: AccentPaletteColor
    danger: DangerPaletteColor
    neutral: NeutralPaletteColor
  }

  interface PaletteOptions {
    accent?: AccentPaletteColorOptions | undefined
    danger?: DangerPaletteColorOptions | undefined
    neutral?: NeutralPaletteColorOptions | undefined
  }

  // Palette Color
  interface PaletteColor {
    base: string
    light1: string
    light2: string
    light3: string
    light4: string
    dark1: string
    dark2: string
  }

  interface PaletteColorOptions {
    base?: string
    main?: string
    light1?: string
    light2?: string
    light3?: string
    light4?: string
    dark1?: string
    dark2?: string
  }

  // Accent Palette
  interface AccentPaletteColor {
    base: string
    light1: string
    light2: string
    dark1: string
    dark2: string
  }

  type AccentPaletteColorOptions = Omit<
    PaletteColorOptions,
    "light3" | "light4"
  >

  // Danger Palette
  interface DangerPaletteColor {
    base: string
    light1: string
    light2: string
    dark1: string
    dark2: string
  }

  type DangerPaletteColorOptions = Omit<
    PaletteColorOptions,
    "light3" | "light4"
  >

  // Neutral Palette
  interface NeutralPaletteColor {
    white: string
    neutral0: string
    neutral10: string
    neutral25: string
    neutral50: string
    neutral75: string
    neutral100: string
    neutral200: string
  }

  interface NeutralPaletteColorOptions {
    white?: string
    neutral0?: string
    neutral10?: string
    neutral25?: string
    neutral50?: string
    neutral75?: string
    neutral100?: string
    neutral200?: string
  }
}
