import * as ex from 'excalibur'

export class Cactus extends ex.Actor {
  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 30,
      height: 50,
      color: ex.Color.Green,
      collisionType: ex.CollisionType.Fixed,
    })
  }
}
