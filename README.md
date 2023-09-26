# Canvas image edit

## Installation

```
yarn add simple-canvas-image-editor
```

## How to use in react
- you can use this with useEffect in react
```js
 const [canvasImage, setCanvasImage] = useState<CanvasImageEdit | null>(null)
  useEffect(() => {
    const loader = new CanvasImageEdit("/wall.jpg")
    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    loader.ImageLoader(canvas)
    loader.result?.brightness(10).render(canvas)

    setCanvasImage(loader)
  }, [])
```

- with canvas component

```js
    <canvas id="canvas" style={{ width: "100%", height: "auto" }} />
```

- For full example see in folder example