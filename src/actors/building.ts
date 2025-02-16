import * as ex from 'excalibur'
import { Player } from './player'

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
    })

    this.targetScene = options.targetScene

    // Calculate door position based on building dimensions
    const doorWidth = 30
    const doorHeight = 10
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
      z: 1,
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
