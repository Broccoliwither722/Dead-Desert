import * as ex from 'excalibur'
import { Resources } from '../resources'
import { DialogBubble } from './dialogBubble'
import { Zombie } from './zombie'
import { HiredActor } from './hiredActor'
import { Player } from './player'
import { Bullet } from './bullet'

export class Gunslinger extends HiredActor {
  private gunslinger: ex.Actor
  private dialogBubble: DialogBubble
  private shootCooldown = 1000 // 1 second between shots
  private lastShotTime = 0
  private fireRate: number = 800 // ms
  private maxPlayerDistance: number = 250
  private minPlayerDistance: number = 80
  private lastShot: number = 0
  private rotationSpeed: number = Math.PI * 2 // One full rotation per second
  private targetRotation: number = 0

  constructor(pos: ex.Vector, player: Player) {
    super({
      player,
      pos,
      width: 40,
      height: 32,
      collisionType: ex.CollisionType.Active,
    })

    this.gunslinger = new ex.Actor({
      width: 40,
      height: 32,
    })
    this.gunslinger.graphics.use(Resources.Gunslinger.toSprite({
      destSize: { width: 40, height: 32 },
    }))
    this.gunslinger.scale = ex.vec(1.5, 1.5)

    this.dialogBubble = new DialogBubble({
      align: 'left',
    })
    this.dialogBubble.pos = ex.vec(-35, -45)

    this.addChild(this.gunslinger)
    this.addChild(this.dialogBubble)
  }

  public onPreUpdate(engine: ex.Engine, delta: number): void {
    super.onPostUpdate(engine, delta)
    // Find nearest non-dead zombie
    const zombies = engine.currentScene.actors.filter(
      (a): a is Zombie => a instanceof Zombie && !a.dead
    )

    const nearestZombie = this.findNearestZombie(zombies)
    
    // Calculate target rotation
    if (nearestZombie) {
      // Look at zombie
      const direction = nearestZombie.pos.sub(this.pos)
      this.targetRotation = direction.toAngle()
    } else {
      // Look at player when no zombies
      const direction = this.player.pos.sub(this.pos)
      this.targetRotation = direction.toAngle()
    }

    // Smoothly rotate towards target
    const rotationDiff = this.targetRotation - this.rotation
    
    // Normalize the difference to be between -PI and PI
    let normalizedDiff = rotationDiff
    while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2
    while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2
    
    // Apply smooth rotation
    const rotationStep = this.rotationSpeed * (delta / 1000)
    if (Math.abs(normalizedDiff) > rotationStep) {
      this.rotation += Math.sign(normalizedDiff) * rotationStep
    } else {
      this.rotation = this.targetRotation
    }

    // Shoot if we have a target and are facing it
    if (nearestZombie && Math.abs(normalizedDiff) < 0.1) {
      const currentTime = Date.now()
      if (currentTime - this.lastShotTime >= this.shootCooldown) {
        const direction = ex.Vector.fromAngle(this.rotation)
        const gunOffset = ex.vec(30, -5).rotate(this.rotation)
        const bulletPos = this.pos.add(gunOffset)
        
        const bullet = new Bullet(bulletPos, direction)
        this.scene?.add(bullet)
        this.lastShotTime = currentTime
      }
    }

    // Distance management from player
    const distanceToPlayer = this.pos.distance(this.player.pos)
    if (distanceToPlayer > this.maxPlayerDistance) {
      const dirToPlayer = this.player.pos.sub(this.pos).normalize()
      this.vel = dirToPlayer.scale(100)
    } else if (distanceToPlayer < this.minPlayerDistance) {
      const dirFromPlayer = this.pos.sub(this.player.pos).normalize()
      this.vel = dirFromPlayer.scale(100)
    } else {
      this.vel = ex.Vector.Zero
    }
  }
}
