import * as ex from 'excalibur'
import { Player } from './player'
import { findPlayer } from '../utils/actorUtils'
import { backgroundGroup } from './sandBackground'

export interface ZombieConfig {
  health: number
  speed: number
  strength?: number
  sprite: ex.Sprite
  deathSprite: ex.Sprite
  pos: ex.Vector
}

export const zombieGroup = new ex.CollisionGroup('zombie', 0b010, ~0b101)

export class Zombie extends ex.Actor {
  public health: number
  private speed: number
  private strength: number
  public dead: boolean = false
  private deathSprite: ex.Sprite
  private deathTriggered: boolean = false
  private damageTimer: number
  private player: Player
  private wanderTarget: ex.Vector | null = null
  private wanderDelay: number = 0
  private readonly WANDER_TIMEOUT: number = 2000 // 2 seconds
  private particleEmitter: ex.ParticleEmitter

  constructor(config: ZombieConfig) {
    super({
      pos: config.pos,
      width: 32,
      height: 32,
      collisionType: ex.CollisionType.Active,
      collisionGroup: zombieGroup,
      collider: new ex.CircleCollider({
        radius: 16,
        offset: ex.vec(0, 0),
      }) as ex.Collider,
    })

    this.strength = config.strength || 1
    this.health = config.health
    this.speed = config.speed
    this.deathSprite = config.deathSprite
    this.graphics.use(config.sprite)
    this.damageTimer = 1000

    // Setup particle emitter for death effect
    this.particleEmitter = new ex.ParticleEmitter({
      emitterType: ex.EmitterType.Circle,
      radius: 5,
      emitRate: 100,
      isEmitting: false,
      particle: {
        minAngle: 0,
        maxAngle: Math.PI * 2,
        opacity: 1,
        fade: true,
        life: 500,
        maxSize: 6,
        minSize: 1,
        startSize: 6,
        endSize: 1,
        angularVelocity: 2,
        vel: new ex.Vector(20, 20),
        maxSpeed: 90,
        acc: new ex.Vector(2, 2),
        beginColor: ex.Color.Red,
        endColor: ex.Color.Red,
      },
    })
    this.addChild(this.particleEmitter)

    this.on('postcollision', (evt) => {
      // Handle player damage
      if (this.health > 0 && !this.dead) {
        this.damageTimer += 1
        if (this.damageTimer >= 500) {
          // Every half second
          if (evt.other.owner instanceof Player) {
            this.damageTimer = 0
            evt.other.owner.damage(this.strength)
          }
        }
      }
    })
  }

  onAdd(engine: ex.Engine): void {
    super.onAdd(engine)

    this.player = findPlayer(engine.currentScene)
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    if (!this.player && this.scene) {
      this.player = findPlayer(this.scene)
    }

    if (this.player && this.health > 0) {
      // Cast ray from zombie to player
      const ray = new ex.Ray(
        this.pos,
        this.player.pos.sub(this.pos).normalize()
      )
      const hits = this.scene!.physics.rayCast(ray, {
        maxDistance: 5000, // Reduce sight distance
        collisionMask: ~backgroundGroup.mask,
        filter: (hit) => !(hit.body.owner instanceof Zombie), // Ignore other zombies
      })

      // First hit should be the player for direct line of sight
      const canSeePlayer =
        hits.length > 0 && hits[0].body.owner instanceof Player

      if (canSeePlayer) {
        // Chase player
        const direction = this.player.pos.sub(this.pos).normalize()
        this.vel = direction.scale(this.speed)
        // this.rotation = direction.toAngle()
        // Rotate slowly towards player
        const angle = direction.toAngle()
        const currentAngle = this.rotation
        const diff = angle - currentAngle
        const deltaAngle = Math.atan2(Math.sin(diff), Math.cos(diff))
        this.rotation += deltaAngle * 0.1
        this.wanderTarget = null
      } else {
        this.handleWandering(delta)
      }
    } else {
      this.vel = ex.Vector.Zero
    }
  }

  private handleWandering(delta: number): void {
    if (!this.wanderTarget) {
      this.wanderDelay -= delta
      if (this.wanderDelay <= 0) {
        // Wander around last known player position or current position
        const center = this.player ? this.player.pos : this.pos
        const randomAngle = Math.random() * Math.PI * 2
        const randomDistance = Math.random() * 100 + 50 // Shorter wander distance
        this.wanderTarget = center.add(
          ex.Vector.fromAngle(randomAngle).scale(randomDistance)
        )
        this.wanderDelay = this.WANDER_TIMEOUT
      }
    }

    if (this.wanderTarget) {
      const direction = this.wanderTarget.sub(this.pos).normalize()
      this.vel = direction.scale(this.speed * 0.5) // Even slower wandering
      // this.rotation = direction.toAngle()
      // Rotate slowly towards target
      const angle = direction.toAngle()
      const currentAngle = this.rotation
      const diff = angle - currentAngle
      const deltaAngle = Math.atan2(Math.sin(diff), Math.cos(diff))
      this.rotation += deltaAngle * 0.1

      if (this.pos.distance(this.wanderTarget) < 10) {
        this.wanderTarget = null
        return
      }
      // Do a raycast to check if we can see the target, if not, reset target
      const ray = new ex.Ray(this.pos, direction)
      const hits = this.scene!.physics.rayCast(ray, {
        maxDistance: 30,
        collisionMask: ~backgroundGroup.mask,
        filter: (hit) => !(hit.body.owner instanceof Zombie),
      })
      if (hits.length > 0) {
        this.wanderTarget = null
      }
    }
  }

  damage(amount: number): void {
    if (this.dead) return // Don't damage if already dead

    this.health -= amount

    // Emit particles
    this.particleEmitter.isEmitting = true
    setTimeout(() => {
      this.particleEmitter.isEmitting = false
    }, 200)
    if (this.health <= 0 && !this.deathTriggered) {
      this.deathTriggered = true // Prevent multiple triggers
      this.die()
    }
  }

  private die(): void {
    if (this.dead) return // Extra safety check

    this.dead = true
    this.collider.clear()
    this.speed = 0
    this.graphics.use(this.deathSprite)

    this.actions.fade(0, 1000).callMethod(() => {
      this.kill()
    })
  }

  public kill(): void {
    if (this.player) {
      this.player.addTokens(1) // Reward 1 token per zombie
    }
    this.emit('killed', this)
    super.kill()
  }
}
