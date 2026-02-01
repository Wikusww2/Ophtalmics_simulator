import * as THREE from 'three'

export type ScreenRefractionUniforms = {
  tBackground: { value: THREE.Texture | null }
  resolution: { value: THREE.Vector2 }
  ior: { value: number }
  thickness: { value: number }
  opacity: { value: number }
}

export function makeScreenRefractionMaterial(ior: number, thickness: number) {
  const uniforms: ScreenRefractionUniforms = {
    tBackground: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
    ior: { value: ior },
    thickness: { value: thickness },
    opacity: { value: 1.0 },
  }

  const mat = new THREE.ShaderMaterial({
    uniforms: uniforms as any,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      void main() {
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        // normalMatrix is inverse transpose of modelView; convert to world by modelMatrix's normal matrix
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D tBackground;
      uniform vec2 resolution;
      uniform float ior; // n_glass
      uniform float thickness; // world units
      uniform float opacity;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;

      // Convert world vector to view space
      vec3 toView(vec3 v) {
        return (viewMatrix * vec4(v, 0.0)).xyz;
      }
      vec3 worldToViewPos(vec3 p) {
        return (viewMatrix * vec4(p, 1.0)).xyz;
      }

      float schlick(float cosTheta, float n1, float n2) {
        float r0 = (n1 - n2) / (n1 + n2);
        r0 = r0 * r0;
        float m = 1.0 - cosTheta;
        return r0 + (1.0 - r0) * m*m*m*m*m;
      }

      void main() {
        // Background UV
        vec2 uv = gl_FragCoord.xy / resolution;

        // View-space quantities
        vec3 Nw = normalize(vWorldNormal);
        vec3 Pw = vWorldPos;
        vec3 Vw = normalize(cameraPosition - Pw);
        vec3 Nv = normalize(toView(Nw));
        vec3 Pv = worldToViewPos(Pw);

        // Refract into the medium (air -> glass)
        float n1 = 1.0;
        float n2 = max(1.0001, ior);
        vec3 Vi = normalize(-Pv); // from fragment toward camera in view space
        vec3 I = -Vi; // incident toward surface
        vec3 T1 = refract(I, Nv, n1 / n2);

        // Travel inside the medium, approximate parallel exit: offset in view space
        float dz = max(1e-4, abs(T1.z));
        vec2 parallax = thickness * T1.xy / dz; // view-space lateral shift

        // Convert view-space shift to NDC offset using proj matrix diagonals
        vec2 ndcShift;
        ndcShift.x = parallax.x * projectionMatrix[0][0] / max(1e-3, -Pv.z);
        ndcShift.y = parallax.y * projectionMatrix[1][1] / max(1e-3, -Pv.z);
        uv += 0.5 * ndcShift; // NDC to UV scale

        // Sample background (clamp to avoid sampling outside)
        uv = clamp(uv, vec2(0.0), vec2(1.0));
        vec3 refractedColor = texture2D(tBackground, uv).rgb;

        // Fresnel mix (simple Schlick at entry)
        float cosTheta = dot(normalize(Vw), Nw);
        float F = schlick(abs(cosTheta), n1, n2);
        vec3 reflectedColor = refractedColor; // fallback, we can sample a blurred variant
        vec3 color = mix(refractedColor, reflectedColor, F * 0.1); // small reflection contribution
        gl_FragColor = vec4(color, opacity);
      }
    `,
  })
  return mat
}

