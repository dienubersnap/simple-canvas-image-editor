export interface AdjustProps {
  exposure: number
  brightness: number
  hightlight: number
  shadows: number
  whites: number
  blacks: number
  temperature: number
  saturation: number
  tint: number
  clip: number
  noise: number
  gamma: number
  hue: number
  sepia: number
  contrast: number
  clarity: number
  sharpness: number
}

export interface SliderProps {
  onChange: (name: string, newValue: number) => void
  name: string
  value: AdjustProps
}

export interface TextFieldProps {
  onChange: (name: string, newValue: number) => void
  name: string
  value: AdjustProps
}
