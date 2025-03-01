import * as ex from 'excalibur'
import { Resources } from '../resources'
import { Player } from './player'
import { GameUI } from '../ui/gameUI'
import { findPlayer } from '../utils/actorUtils'
import { DialogBubble } from './dialogBubble'

export class ShopKeeper extends ex.Actor {
  private counter: ex.Actor
  private keeper: ex.Actor
  private detectionZone: ex.Actor
  private player: Player | null = null
  private dialogBubble: DialogBubble
  private greetings = [
    'Welcome to my shop, partner!',
    'Need some supplies?',
    'Got some fine wares for ya!',
    'Best deals in the desert!',
  ]
  private goodbyes = [
    'Stay safe out there!',
    'Come back soon!',
    'Watch your back out there!',
    'Thanks for stopping by!',
    'Stay alive out there!',
    'Mind them zombies!',
  ]

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 75,
      height: 150,
    })

    // Create counter
    this.counter = new ex.Actor({
      pos: ex.vec(10, 0),
      width: 50,
      height: 220,
      color: ex.Color.fromHex('#4a3728'),
      collisionType: ex.CollisionType.Fixed,
    })
    this.counter.graphics.use(Resources.Shop.toSprite())

    // Create shopkeeper sprite
    this.keeper = new ex.Actor({
      pos: ex.vec(-45, 0),
      width: 32,
      height: 32,
      collisionType: ex.CollisionType.Passive,
    })
    this.keeper.scale = ex.vec(0.17, 0.17)
    this.keeper.graphics.use(Resources.shopkeeper.toSprite())

    // Create detection zone (15px larger than the entire setup)
    this.detectionZone = new ex.Actor({
      pos: ex.vec(0, 0),
      width: 140, // 50 + 32 + 28 (original width + padding)
      height: 210, // 150 + 32 + 28 (original height + padding)
      collisionType: ex.CollisionType.Passive,
      //@ts-ignore - Excalibur.js types are missing PolygonCollider
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
        this.showGreeting()
      }
    })

    this.detectionZone.on('collisionend', (evt) => {
      if (evt.other.owner instanceof Player) {
        GameUI.getInstance().hideShop()
        this.showGoodbye()
      }
    })

    // Create and position dialog bubble
    this.dialogBubble = new DialogBubble({
      align: 'left',
    })
    this.dialogBubble.pos = ex.vec(-35, -55) // Position above keeper's head
    this.addChild(this.dialogBubble)

    // Add all components
    this.addChild(this.detectionZone)
    this.addChild(this.counter)
    this.addChild(this.keeper)
  }

  private showGreeting(): void {
    const randomGreeting =
      this.greetings[Math.floor(Math.random() * this.greetings.length)]
    this.dialogBubble.showMessage(randomGreeting)
  }

  private showGoodbye(): void {
    const randomGoodbye =
      this.goodbyes[Math.floor(Math.random() * this.goodbyes.length)]
    this.dialogBubble.showMessage(randomGoodbye)
  }
}
