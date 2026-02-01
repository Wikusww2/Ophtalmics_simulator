import * as THREE from 'three'

export type MagnifyUniforms = {
  tBackground: { value: THREE.Texture | null }
  resolution: { value: THREE.Vector2 }
  radiusUnits: { value: number }
  sphD: { value: number }
  cylD: { value: number }
  axisRad: { value: number }
  pxPerD: { value: number }
  opacity: { value: number }
  edgeFeather: { value: number }
  minusEdgeStrength: { value: number }
  minusEdgeMax: { value: number }
  blurMaxPx: { value: number }
}

export function makeMagnifyMaterial() {
  const uniforms: MagnifyUniforms = {
    tBackground: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
    radiusUnits: { value: 0.035 }, // ~35mm in world units (0.035)
    sphD: { value: 0 },
    cylD: { value: 0 },
    axisRad: { value: 0 },
    pxPerD: { value: 0.25 }, // pixels of edge shift per diopter (adjusted in host)
    opacity: { value: 1.0 },
    edgeFeather: { value: 0.02 },
    minusEdgeStrength: { value: 0.0 },
    minusEdgeMax: { value: 0.0 },
    blurMaxPx: { value: 2.0 },
  }

  const mat = new THREE.ShaderMaterial({
    uniforms: uniforms as any,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    vertexShader: `
      varying vec2 vXY; // lens local XY in world units
      void main() {
        vXY = position.xy; // geometry already in lens local plane (scaled mm -> units)
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D tBackground;
      uniform vec2 resolution;
      uniform float radiusUnits; // lens radius in world units
      uniform float sphD, cylD, axisRad, pxPerD, opacity, edgeFeather;
      uniform float minusEdgeStrength, minusEdgeMax, blurMaxPx;
      varying vec2 vXY;

      float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }

      void main(){
        vec2 uv = gl_FragCoord.xy / resolution;
        // Normalize local XY to edge radius
        vec2 q = vXY / max(1e-6, radiusUnits);
        float r = length(q);
        // Power weights: sphere uniform; cylinder along perp to axis
        vec2 dirAxis = vec2(cos(axisRad), sin(axisRad));
        vec2 dirPower = vec2(-dirAxis.y, dirAxis.x); // perpendicular to axis
        float projP = dot(q, dirPower);
        codex/clean-up-duplicate-workspace-and-align-rendering-ff2g97
        // Refraction offset in pixel units: inward for plus, outward for minus
        // Negative sign matches clinical convention so +D magnifies (inward) and −D minifies (outward)
        vec2 offsetPx = -pxPerD * (sphD * q + cylD * projP * dirPower);
        // Convert px -> uv
        vec2 offsetUV = offsetPx / resolution;
        vec2 sampUV = clamp(uv + offsetUV, vec2(0.0), vec2(1.0));
        vec3 col = texture2D(tBackground, sampUV).rgb;

        // Anisotropic blur along cylinder power meridian to visualize astigmatic defocus
        float blurPx = clamp(abs(cylD) * pxPerD * 0.7, 0.0, blurMaxPx);
        if (blurPx > 0.0) {
          vec2 d = (blurPx / resolution) * dirPower; // blur direction in UV
          vec3 s0 = texture2D(tBackground, clamp(sampUV - 2.0*d, vec2(0.0), vec2(1.0))).rgb;
          vec3 s1 = texture2D(tBackground, clamp(sampUV - 1.0*d, vec2(0.0), vec2(1.0))).rgb;
          vec3 s3 = texture2D(tBackground, clamp(sampUV + 1.0*d, vec2(0.0), vec2(1.0))).rgb;
          vec3 s4 = texture2D(tBackground, clamp(sampUV + 2.0*d, vec2(0.0), vec2(1.0))).rgb;
          col = s0*0.153170 + s1*0.221461 + col*0.250739 + s3*0.221461 + s4*0.153170;
        }

        // Darken only when spherical equivalent is minus and displacement is strictly outward (minification)
        codex/clean-up-duplicate-workspace-and-align-rendering-ff2g97
        float outward = (dot(offsetPx, q) > 1e-6) ? 1.0 : 0.0; // exclude near-zero so +D never darkens
        float se = sphD + 0.5 * cylD; // spherical equivalent
        float hasMinus = (se < 0.0) ? 1.0 : 0.0;
        if (hasMinus > 0.5 && outward > 0.5) {
          vec2 px = 1.0 / resolution;
          vec3 cC = col;
          vec3 cR = texture2D(tBackground, clamp(sampUV + vec2(px.x, 0.0), vec2(0.0), vec2(1.0))).rgb;
          vec3 cL = texture2D(tBackground, clamp(sampUV - vec2(px.x, 0.0), vec2(0.0), vec2(1.0))).rgb;
          vec3 cU = texture2D(tBackground, clamp(sampUV + vec2(0.0, px.y), vec2(0.0), vec2(1.0))).rgb;
          vec3 cD = texture2D(tBackground, clamp(sampUV - vec2(0.0, px.y), vec2(0.0), vec2(1.0))).rgb;
          float e = 0.0;
          e += abs(luma(cC) - luma(cR));
          e += abs(luma(cC) - luma(cL));
          e += abs(luma(cC) - luma(cU));
          e += abs(luma(cC) - luma(cD));
          e *= 0.5; // scale edge magnitude
          float dark = min(minusEdgeMax, minusEdgeStrength * e);
          col *= (1.0 - dark);
        }

        // Robust edge feather: alpha = 1 inside, fades to 0 near rim
        float a = opacity * smoothstep(1.0 - edgeFeather, 1.0, 1.0 - r);
        gl_FragColor = vec4(col, a);
      }
    `,
  })
  return mat
}
