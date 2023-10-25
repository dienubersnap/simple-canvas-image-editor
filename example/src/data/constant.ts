import { AdjustProps } from "@src/components/image-editor/adjust/types"

const defaultValueAdjust: AdjustProps = {
  exposure: 0,
  brightness: 0,
  hightlight: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  saturation: 0,
  tint: 0,
  contrast: 0,
  clarity: 0,
  sharpness: 0,
  clip: 0,
  noise: 0,
  gamma: 0,
  hue: 0,
  sepia: 0,
}

const minMaxSlider: { [key: string]: { min: number; max: number } } = {
  exposure: { min: -100, max: 100 },
  brightness: { min: -100, max: 100 },
  hightlight: { min: -50, max: 50 },
  shadows: { min: -50, max: 50 },
  whites: { min: -50, max: 50 },
  blacks: { min: -50, max: 50 },
  temperature: { min: -100, max: 100 },
  saturation: { min: -100, max: 100 },
  tint: { min: -100, max: 100 },
  contrast: { min: -20, max: 20 },
  clarity: { min: 0, max: 100 },
  sharpness: { min: 0, max: 100 },
  clip: { min: 0, max: 100 },
  noise: { min: 0, max: 100 },
  gamma: { min: 0, max: 100 },
  hue: { min: 0, max: 100 },
  sepia: { min: 0, max: 100 },
}

const moreActionButton = [
  {
    title: "Revert to original",
    iconImage: "Refresh.svg",
  },
  {
    title: "Copy edits",
    iconImage: "Copy.svg",
  },
  {
    title: "Paste edits",
    iconImage: "Copy-Success.svg",
  },
]

const ItemAdjust = [
  {
    title: "Light",
    content: [
      {
        name: "Exposure",
      },
      {
        name: "Brightness",
      },
      {
        name: "Hightlight",
      },
      {
        name: "Shadows",
      },
      {
        name: "Whites",
      },
      {
        name: "Blacks",
      },
    ],
  },
  {
    title: "Colour",
    content: [
      {
        name: "Temperature",
      },
      {
        name: "Tint",
      },
      {
        name: "Saturation",
      },
    ],
  },
  {
    title: "Details",
    content: [
      {
        name: "Contrast",
      },
      {
        name: "Clarity",
      },
      {
        name: "Sharpness",
      },
    ],
  },
  {
    title: "Others",
    content: [
      { name: "Clip" },
      { name: "Noise" },
      { name: "Gamma" },
      { name: "Sepia" },
      { name: "Hue" },
    ],
  },
  {
    title: "Presets",
    content: [],
  },
]

// https://img.ly/docs/pesdk/web/features/transform/#adding-custom-crop-ratios
// source chatGPT with prompt
/**
can you definition this aspect ratio
1*1
2*3
9*16
3*2
16*9
i want to explain with pixel. like 1*1 = x: 1080, y: 1080
 */

const itemTransform = [
  {
    identifier: "custom_transform_1x1",
    name: "1x1",
    thumbnailURI: "",
    ratio: 1 / 1,
    dimensions: {
      x: 1080,
      y: 1080,
    },
    forceDimensions: false,
    lockDimensions: false,
  },
  {
    identifier: "custom_transform_2x3",
    name: "2:3",
    thumbnailURI: "",
    ratio: 2 / 3,
    dimensions: {
      x: 720,
      y: 1080,
    },
    forceDimensions: false,
    lockDimensions: false,
  },
  {
    identifier: "custom_transform_3x2",
    name: "3:2",
    thumbnailURI: "",
    ratio: 3 / 2,
    dimensions: {
      x: 1080,
      y: 720,
    },
    forceDimensions: false,
    lockDimensions: false,
  },
  {
    identifier: "custom_transform_4x3",
    name: "4:3",
    thumbnailURI: "",
    ratio: 4 / 3,
    dimensions: {
      x: 720,
      y: 540,
    },
    forceDimensions: false,
    lockDimensions: false,
  },
  {
    identifier: "custom_transform_9x6",
    name: "9:6",
    thumbnailURI: "",
    ratio: 9 / 6,
    dimensions: {
      x: 1080,
      y: 1920,
    },
    forceDimensions: false,
    lockDimensions: false,
  },
  {
    identifier: "custom_transform_16x9",
    name: "16:9",
    thumbnailURI: "",
    ratio: 16 / 9,
    dimensions: {
      x: 1920,
      y: 1080,
    },
    forceDimensions: false,
    lockDimensions: false,
  },
]

export {
  itemTransform,
  ItemAdjust,
  moreActionButton,
  defaultValueAdjust,
  minMaxSlider,
}
