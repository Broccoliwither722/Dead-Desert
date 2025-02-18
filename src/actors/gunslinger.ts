import * as ex from 'excalibur'
import { Resources } from '../resources'
import { DialogBubble } from './dialogBubble'
import { Zombie } from './zombie'

export class Gunslinger extends ex.Actor {
  private gunslinger: ex.Actor
  private dialogBubble: DialogBubble
  private detectionRange = 300
  private shootCooldown = 1000 // 1 second between shots
  private lastShotTime = 0

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 32,
      height: 32,
      collisionType: ex.CollisionType.Active,
    })

    this.gunslinger = new ex.Actor({
      width: 32,
      height: 32,
    })
    this.gunslinger.graphics.use(Resources.Gunslinger.toSprite())
    this.gunslinger.scale = ex.vec(1.5, 1.5)

    this.dialogBubble = new DialogBubble({
      align: 'left',
      style: 'ChatBubble2',
    })
    this.dialogBubble.pos = ex.vec(-35, -45)

    this.addChild(this.gunslinger)
    this.addChild(this.dialogBubble)
  }

  public onPostUpdate(engine: ex.Engine, delta: number) {
    super.onPostUpdate(engine, delta)

    // Find nearest zombie
    const zombies = engine.currentScene.actors.filter(
      (a): a is Zombie => a instanceof Zombie
    )

    const currentTime = Date.now()
    if (currentTime - this.lastShotTime >= this.shootCooldown) {
      const nearestZombie = this.findNearestZombie(zombies)
      if (nearestZombie) {
        this.shootAt(nearestZombie)
        this.lastShotTime = currentTime
      }
    }
  }

  private findNearestZombie(zombies: Zombie[]): Zombie | null {
    let nearest: Zombie | null = null
    let shortestDistance = this.detectionRange

    zombies.forEach((zombie) => {
      const distance = this.pos.distance(zombie.pos)
      if (distance < shortestDistance) {
        shortestDistance = distance
        nearest = zombie
      }
    })

    return nearest
  }

  private shootAt(target: Zombie): void {
    // Handle shooting logic
    // This will be implemented when we add projectile system
    this.dialogBubble.showMessage('Bang!', 500)
  }
}
