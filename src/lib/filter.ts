import Calculate from "./calculate.ts";
import Curves from "./curve.ts";

interface ColorRGBA {
    r: number;
    g: number;
    b: number;
    a: number;
  }
  class Filter {
    static Brightness({ r, g, b, a }: ColorRGBA, adjust: number): ColorRGBA {
      adjust = Math.floor((adjust / 100) * 255);
  
      r = Math.min(255, Math.max(0, r + adjust));
      g = Math.min(255, Math.max(0, g + adjust));
      b = Math.min(255, Math.max(0, b + adjust));
  
      return { r: r, g: g, b: b, a: a };
    }
  
    static Saturation({ r, g, b, a }: ColorRGBA, adjust: number): ColorRGBA {
      const saturationCorrection = adjust * -0.01;
  
      const max = Math.max(r, g, b);
      if (r !== max) r += (max - r) * saturationCorrection;
      if (g !== max) g += (max - g) * saturationCorrection;
      if (b !== max) b += (max - b) * saturationCorrection;
  
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
  
      return { r: r, g: g, b: b, a: a };
    }
  }
  
  export default Filter;