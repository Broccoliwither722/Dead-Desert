import * as ex from 'excalibur'

export class SandBackground extends ex.Actor {
  private time = 0

  constructor(width: number, height: number) {
    super({
      pos: ex.vec(0, 0),
      anchor: ex.vec(0, 0),
      width,
      height,
      z: -1,
      color: ex.Color.fromHex('#ffd081'),
      collisionType: ex.CollisionType.PreventCollision,
    })
  }

  onInitialize(engine: ex.Engine) {
    // Create custom shader material
    const material = engine.graphicsContext.createMaterial({
      name: 'sand-material',
      fragmentSource: `#version 300 es
        precision mediump float;
        
        uniform float uTime;
        uniform vec2 uResolution;
        
        out vec4 fragColor;
        
        // 2D Random
        float random (vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        // 2D Noise
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(a, b, u.x) +
                  (c - a)* u.y * (1.0 - u.x) +
                  (d - b) * u.x * u.y;
        }

        void main() {
          vec2 st = gl_FragCoord.xy/uResolution.xy;
          st.x *= uResolution.x/uResolution.y;
          
          vec2 pos = st * 8.0;
          pos.y += uTime * 0.2; // Slow vertical movement
          
          float n = noise(pos) * 0.5 + 0.5;
          
          // Sand base color (#ffd081)
          vec3 baseColor = vec3(1.0, 0.816, 0.506);
          vec3 sandColor = mix(baseColor * 0.8, baseColor * 1.2, n);
          
          fragColor = vec4(sandColor, 1.0);
        }`,
    })

    // Set uniforms for resolution
    material.update((shader) => {
      shader.trySetUniformFloatVector(
        'uResolution',
        ex.vec(this.width, this.height)
      )
    })

    // Apply material to actor
    this.graphics.material = material
  }
}
