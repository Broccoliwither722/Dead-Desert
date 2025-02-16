import * as ex from 'excalibur'

export const backgroundGroup = new ex.CollisionGroup('sand', 0b100, ~0b011)

export class SandBackground extends ex.Actor {
  private walls: ex.Actor[] = []


  constructor(width: number, height: number) {
    super({
      pos: ex.vec(0, 0),
      anchor: ex.vec(0, 0),
      width,
      height,
      z: -1,
      color: ex.Color.fromHex('#ffd081'),

      collisionGroup: backgroundGroup,
      collisionType: ex.CollisionType.PreventCollision,
    })

    // Initialize actors with temporary positions (will be updated in onActivate)
  }

  private createWalls(engine: ex.Engine): ex.Actor[] {
    return [
      new ex.Actor({
        // Top wall
        width: 100, // base width
        height: 20,
        collisionGroup: backgroundGroup,
        collisionType: ex.CollisionType.Fixed,
      }),
      new ex.Actor({
        // Bottom wall
        width: 100, // base width
        height: 20,
        collisionGroup: backgroundGroup,
        collisionType: ex.CollisionType.Fixed,
      }),
      new ex.Actor({
        // Left wall
        width: 20,
        height: 100, // base height
        collisionGroup: backgroundGroup,
        collisionType: ex.CollisionType.Fixed,
      }),
      new ex.Actor({
        // Right wall
        width: 20,
        height: 100, // base height
        collisionGroup: backgroundGroup,
        collisionType: ex.CollisionType.Fixed,
      }),
    ]
  }

  onInitialize(engine: ex.Engine) {
    this.walls = this.createWalls(engine)
    this.walls.forEach((wall) => this.addChild(wall))

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

  public positionWalls(engine: ex.Engine) {
    // Get current screen dimensions
    const screenWidth = engine.screen.resolution.width
    const screenHeight = engine.screen.resolution.height
    const center = engine.screen.center

    // Update wall positions and scales
    const [topWall, bottomWall, leftWall, rightWall] = this.walls

    topWall.pos = ex.vec(center.x, 0)
    topWall.scale = ex.vec(screenWidth / 100, 1) // scale based on base width

    bottomWall.pos = ex.vec(center.x, screenHeight)
    bottomWall.scale = ex.vec(screenWidth / 100, 1)

    leftWall.pos = ex.vec(0, center.y)
    leftWall.scale = ex.vec(1, screenHeight / 100) // scale based on base height

    rightWall.pos = ex.vec(screenWidth, center.y)
    rightWall.scale = ex.vec(1, screenHeight / 100)
  }
}
