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
    opacity: { value: 0.92 },
  }

  const mat = new THREE.ShaderMaterial({
    uniforms: uniforms as any,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
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
      uniform float sphD, cylD, axisRad, pxPerD, opacity;
      varying vec2 vXY;

      void main(){
        vec2 uv = gl_FragCoord.xy / resolution;
        // Normalize local XY to edge radius
        vec2 q = vXY / max(1e-6, radiusUnits);
        // Power weights: sphere uniform; cylinder along perp to axis: sin^2
        vec2 dirAxis = vec2(cos(axisRad), sin(axisRad));
        vec2 dirPower = vec2(-dirAxis.y, dirAxis.x); // perpendicular to axis
        float projP = dot(q, dirPower);
        // Refraction offset in pixel units: inward for plus, outward for minus
        vec2 offsetPx = (-pxPerD * sphD) * q + (-pxPerD * cylD) * projP * dirPower;
        // Convert px -> uv
        vec2 offsetUV = offsetPx / resolution;
        vec2 sampUV = clamp(uv + offsetUV, vec2(0.0), vec2(1.0));
        vec3 col = texture2D(tBackground, sampUV).rgb;
        gl_FragColor = vec4(col, opacity);
      }
    `,
  })
  return mat
}
