import * as ex from 'excalibur'
import { Player } from './player'
import { Resources } from '../resources'
import { spawnableGroup } from '../utils/actorUtils'

export class AmmoBox extends ex.Actor {
  constructor(options: { pos: ex.Vector }) {
    super({
      pos: options.pos,
      width: 36,
      height: 25,
      color: ex.Color.fromHex('#1a472a'), // Dark green
      collisionType: ex.CollisionType.Passive,
      collisionGroup: spawnableGroup,
      z: 0,
    })
    this.graphics.use(
      Resources.AmmoBox.toSprite({
        destSize: {
          // Optionally specify a different projected size, otherwise use the source
          width: 36,
          height: 36,
        },
      })
    )
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
