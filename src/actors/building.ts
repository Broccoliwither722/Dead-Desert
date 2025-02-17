import * as ex from 'excalibur'
import { Player } from './player'
import { Resources } from '../resources'

export class Building extends ex.Actor {
  private door: ex.Actor
  private targetScene: string

  constructor(options: {
    pos: ex.Vector
    width: number
    height: number
    color: ex.Color
    targetScene: string
    doorPosition: 'north' | 'south' | 'east' | 'west'
  }) {
    super({
      pos: options.pos,
      width: options.width,
      height: options.height,
      color: options.color,
      collisionType: ex.CollisionType.Fixed,
      z: -1,
    })
    this.graphics.use(Resources.Saloon.toSprite())

    this.targetScene = options.targetScene

    // Calculate door position based on building dimensions
    const doorWidth = 50
    const doorHeight = 18
    let doorPos = options.pos.clone()

    switch (options.doorPosition) {
      case 'north':
        doorPos.y -= options.height / 2
        break
      case 'south':
        doorPos.y += options.height / 2
        break
      case 'east':
        doorPos.x += options.width / 2
        break
      case 'west':
        doorPos.x -= options.width / 2
        break
    }

    this.door = new ex.Actor({
      pos: doorPos,
      width: doorWidth,
      height: doorHeight,
      opacity: 0,

      z: 0,
      // Dark brown door
      color: ex.Color.fromHex('#8B4513'),
    })
  }

  onInitialize(engine: ex.Engine): void {
    this.scene?.add(this.door)

    this.door.on('collisionstart', (evt) => {
      if (
        evt.other.owner instanceof Player &&
        !engine.currentScene['waveController']?.waveActive
      ) {
        engine.goToScene(this.targetScene)
      }
    })
  }
}
