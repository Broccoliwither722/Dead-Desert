import * as ex from 'excalibur'
import { Resources } from '../resources'
import { Player } from './player'
import { GameUI } from '../ui/gameUI'

export class ShopKeeper extends ex.Actor {
  private counter: ex.Actor
  private keeper: ex.Actor
  private detectionZone: ex.Actor
  private player: Player | null = null

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 75,
      height: 150,
    })

    // Create counter
    this.counter = new ex.Actor({
      pos: ex.vec(25, 0),
      width: 75,
      height: 175,
      color: ex.Color.fromHex('#4a3728'),
      collisionType: ex.CollisionType.Fixed,
    })

    // Create shopkeeper sprite
    this.keeper = new ex.Actor({
      pos: ex.vec(-45, 0),
      width: 32,
      height: 32,
      collisionType: ex.CollisionType.Passive,
    })
    this.keeper.scale = ex.vec(1.5, 1.5)
    this.keeper.graphics.use(Resources.shopkeeper.toSprite())

    // Create detection zone (15px larger than the entire setup)
    this.detectionZone = new ex.Actor({
      pos: ex.vec(0, 0),
      width: 140, // 50 + 32 + 28 (original width + padding)
      height: 210, // 150 + 32 + 28 (original height + padding)
      collisionType: ex.CollisionType.Passive,
      collider: new ex.PolygonCollider({
        points: [
          ex.vec(-70, -105),
          ex.vec(70, -105),
          ex.vec(70, 105),
          ex.vec(-70, 105),
        ],
      }),
    })

    // Move collision handling to detection zone
    this.detectionZone.on('collisionstart', (evt) => {
      if (evt.other.owner instanceof Player) {
        GameUI.getInstance().showShop()
      }
    })

    this.detectionZone.on('collisionend', (evt) => {
      if (evt.other.owner instanceof Player) {
        GameUI.getInstance().hideShop()
      }
    })

    // Add all components
    this.addChild(this.detectionZone)
    this.addChild(this.counter)
    this.addChild(this.keeper)
  }

  onPreUpdate(engine: ex.Engine): void {
    if (!this.player) {
      this.player = this.scene?.actors.find(
        (actor) => actor instanceof Player
      ) as unknown as Player
    }

    if (this.player) {
      // Make shopkeeper look at player
      const direction = this.keeper.pos.sub(this.player.pos)
      this.keeper.rotation = direction.toAngle()
    }
  }
}
