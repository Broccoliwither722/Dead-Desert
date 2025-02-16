import * as ex from 'excalibur'
import { Player } from './player'
import { findPlayer } from '../utils/actorUtils'

export interface ZombieConfig {
  health: number
  speed: number
  strength?: number
  sprite: ex.Sprite
  deathSprite: ex.Sprite
  pos: ex.Vector
}

export class Zombie extends ex.Actor {
  public health: number
  private speed: number
  private strength: number
  public dead: boolean = false
  private deathSprite: ex.Sprite
  private deathTriggered: boolean = false
  private damageTimer: number
  private player: Player

  constructor(config: ZombieConfig) {
    super({
      pos: config.pos,
      width: 32,
      height: 32,
      collisionType: ex.CollisionType.Active,
      collider: new ex.CircleCollider({
        radius: 16,
        offset: ex.vec(0, 0),
      }),
    })

    this.strength = config.strength || 1
    this.health = config.health
    this.speed = config.speed
    this.deathSprite = config.deathSprite
    this.graphics.use(config.sprite)
    this.damageTimer = 1000

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
      // Try to find player if not set yet (backup)
      this.player = this.scene.actors.find(
        (actor) => actor instanceof Player
      ) as unknown as Player
    }

    if (this.player && this.health > 0) {
      const direction = this.player.pos.sub(this.pos).normalize()
      this.vel = direction.scale(this.speed)
      this.rotation = direction.toAngle()
    } else {
      this.vel = ex.Vector.Zero
    }
  }

  damage(amount: number): void {
    if (this.dead) return // Don't damage if already dead

    this.health -= amount
    if (this.health <= 0 && !this.deathTriggered) {
      this.deathTriggered = true // Prevent multiple death triggers
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
      this.player.addTokens(1) // Reward 1 token per kill
    }
    this.emit('killed', this)
    super.kill()
  }
}
