import * as ex from 'excalibur'
import { Player } from './player'

export class AmmoBox extends ex.Actor {
  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 12,
      height: 36,
      color: ex.Color.fromHex('#1a472a'), // Dark green
      collisionType: ex.CollisionType.Passive,
    })
  }

  onInitialize() {
    this.on('precollision', (evt) => {
      if (evt.other.owner instanceof Player) {
        ;(evt.other.owner as Player).addAmmo(12)
        this.kill()
      }
    })
  }
}
