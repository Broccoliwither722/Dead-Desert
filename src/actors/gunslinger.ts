import * as ex from 'excalibur'
import { Resources } from '../resources'
import { DialogBubble } from './dialogBubble'
import { Zombie } from './zombie'
import { HiredActor } from './hiredActor'
import { Player } from './player'
import { Bullet } from './bullet'
import { playerGroup } from '../utils/actorUtils'

export class Gunslinger extends HiredActor {
  private gunslinger: ex.Actor
  private dialogBubble: DialogBubble // Dialog bubble for the gunslinger
  private shootCooldown = 1500 // Time between shots
  private lastShotTime = 0 // Last time we shot
  private maxPlayerDistance: number = 250 // Stay within this distance of player
  private minPlayerDistance: number = 80 // Stay within this distance of player
  private rotationSpeed: number = Math.PI * 2 // One full rotation per second
  private targetRotation: number = 0

  private catchphrases = [
    'Draw!',
    "This town ain't big enough for the two of us!",
    "You feelin' lucky, zombie?",
    "I'm your huckleberry.",
    'Say hello to my little friend!',
    "Stick 'em up!",
    "You gonna do somethin' or just stand there and bleed?",
    'You got a problem, friend?',
    'You want a piece of me?',
    "You got a lot of nerve comin' here.",
    "You ain't from around here, are ya?",
    'You got a double-death wish?',
    'You want a lead salad?',
    'You want a piece of the action?',
    "You ain't gettin' these brains!",
    'Bam!',
    'Bang!',
    'Pow!',
    'Take that!',
    "You're done for!",
    "You're finished!",
    "You're history!",
    "You're toast!",
    "You're outta here!",
  ]

  constructor(pos: ex.Vector, player: Player) {
    super({
      player,
      pos,
      width: 40,
      height: 32,
      collisionType: ex.CollisionType.Active,
      collisionGroup: playerGroup,
    })

    this.gunslinger = new ex.Actor({
      width: 40,
      height: 32,
    })
    this.gunslinger.graphics.use(
      Resources.Gunslinger.toSprite({
        destSize: { width: 40, height: 32 },
      })
    )
    this.gunslinger.scale = ex.vec(1.5, 1.5)

    this.dialogBubble = new DialogBubble({
      align: 'left',
    })
    this.dialogBubble.pos = ex.vec(35, -45)

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
    const rotationDiff = this.targetRotation - this.gunslinger.rotation

    // Normalize the difference to be between -PI and PI
    let normalizedDiff = rotationDiff
    while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2
    while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2

    // Apply smooth rotation
    const rotationStep = this.rotationSpeed * (delta / 1000)
    if (Math.abs(normalizedDiff) > rotationStep) {
      this.gunslinger.rotation += Math.sign(normalizedDiff) * rotationStep
    } else {
      this.gunslinger.rotation = this.targetRotation
    }

    // Shoot if we have a target and are facing it
    if (nearestZombie && Math.abs(normalizedDiff) < 0.1) {
      const currentTime = Date.now()
      if (currentTime - this.lastShotTime >= this.shootCooldown) {
        const direction = ex.Vector.fromAngle(this.gunslinger.rotation)
        const gunOffset = ex.vec(30, -5).rotate(this.gunslinger.rotation)
        const bulletPos = this.pos.add(gunOffset)

        const bullet = new Bullet(bulletPos, direction)
        this.scene?.add(bullet)
        this.lastShotTime = currentTime
        if (Math.random() > 0.8) {
          this.dialogBubble.showMessage(
            this.catchphrases[
              Math.floor(Math.random() * this.catchphrases.length)
            ]
          )
        }
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
