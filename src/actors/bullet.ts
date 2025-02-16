import * as ex from 'excalibur'
import { Zombie } from './zombie'
import { Player } from './player'

export class Bullet extends ex.Actor {
  constructor(pos: ex.Vector, direction: ex.Vector, speed: number = 600) {
    super({
      pos: pos,
      width: 8,
      height: 5,
      color: ex.Color.Yellow,
    })

    this.vel = direction.normalize().scale(speed)
    this.rotation = direction.toAngle()
  }

  onInitialize(): void {
    this.on('collisionstart', (evt) => {
      const otherAsZombie = evt.other.owner as Zombie
      if (otherAsZombie instanceof Zombie && !otherAsZombie.dead) {
        otherAsZombie.damage(1)
      }
      if (!(evt.other.owner instanceof Player)) {
        this.kill()
      }
    })

    // Destroy bullet after 2 seconds
    this.actions.delay(2000).callMethod(() => {
      this.kill()
    })
  }
}
