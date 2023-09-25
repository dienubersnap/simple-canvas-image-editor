# Canvas image edit

## Installation

```
yarn add canvas-image-editor
```

## How to use
- you can use this with useEffect in react
```js
 const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [src, setSrc] = useState("https://dev.service.ubersnap.com/gallery/download-one?id=64a395072360f42d8d11a816")
  
  useEffect(() => {
    const process = new CanvasImageProcessor(src, "#hello",)
    process.Adjustment(brightness, saturation).render()
  },[brightness, saturation, src])
```

- with image component

```js
    <img id='#hello' src={src} height={280} width={280} alt=''/>
```