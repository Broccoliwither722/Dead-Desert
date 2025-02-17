import * as ex from 'excalibur'
import { Player } from './player'
import { Resources } from '../resources'

export class Healthpack extends ex.Actor {
  constructor(options) {
    super({
      pos: options.pos,
      width: 36,
      height: 36,
      color: ex.Color.fromHex('#ff0000'),
      collisionType: ex.CollisionType.Passive,
    })
    this.graphics.use(Resources.Healthpack.toSprite({}))
  }

  onInitialize() {
    this.on('precollision', (evt) => {
      if (evt.other.owner instanceof Player) {
        ;(evt.other.owner as Player).heal(5)
        this.kill()
      }
    })
  }
}
