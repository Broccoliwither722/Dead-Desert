import * as ex from 'excalibur'
import { Player } from './player'
import { Resources } from '../resources'
import { spawnableGroup } from '../utils/actorUtils'

export class Healthpack extends ex.Actor {
  constructor(options: { pos: ex.Vector }) {
    super({
      pos: options.pos,
      width: 36,
      height: 36,
      color: ex.Color.fromHex('#ff0000'),
      collisionType: ex.CollisionType.Passive,
      collisionGroup: spawnableGroup,
      z: 0,
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
