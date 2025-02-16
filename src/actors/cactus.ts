import * as ex from 'excalibur'
import { Resources } from '../resources'

export class Cactus extends ex.Actor {
  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 30,
      height: 50,
      z: 3,
      color: ex.Color.Green,
      collisionType: ex.CollisionType.Fixed,
    })
    this.graphics.use(Resources.Cactus.toSprite())
  }
}
