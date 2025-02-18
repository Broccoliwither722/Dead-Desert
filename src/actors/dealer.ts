import * as ex from 'excalibur'
import { Resources } from '../resources'
import { Player } from './player'
import { GameUI } from '../ui/gameUI'
import { DialogBubble } from './dialogBubble'

export class Dealer extends ex.Actor {
  private dealer: ex.Actor
  private detectionZone: ex.Actor
  private dialogBubble: DialogBubble
  private greetings = [
    'Need some extra hands?',
    'I got people who can help...',
    'Looking for hired guns?',
    'Want some backup out there?',
  ]
  private goodbyes = [
    'Your loss...',
    'Come back when you need muscle.',
    'Stay alive, you might need help later.',
    'The offer stands...',
  ]

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 75,
      height: 150,
      z: 2,
      rotation: -Math.PI, // Counter-rotate to compensate for chair rotation
    })
    console.log('Dealer constructor called with position:', pos)

    // Create dealer sprite
    this.dealer = new ex.Actor({
      pos: ex.vec(0, 10),
      width: 32,
      height: 32,
      rotation: 0, // No additional rotation needed since parent is rotated
      collisionType: ex.CollisionType.Passive,
      z: 2,
    })
    this.dealer.scale = ex.vec(0.17, 0.17)
    this.dealer.graphics.use(
      Resources.Dealer.toSprite({
        scale: ex.vec(1.5, 1.5),
      })
    ) // You'll need to add this sprite
    console.log('Dealer sprite created with scale:', this.dealer.scale)

    // Create detection zone
    this.detectionZone = new ex.Actor({
      pos: ex.vec(0, 0),
      width: 140,
      height: 210,
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

    this.detectionZone.on('collisionstart', (evt) => {
      if (evt.other.owner instanceof Player) {
        GameUI.getInstance().showHireMenu()
        this.showGreeting()
      }
    })

    this.detectionZone.on('collisionend', (evt) => {
      if (evt.other.owner instanceof Player) {
        GameUI.getInstance().hideHireMenu()
        this.showGoodbye()
      }
    })

    // Adjust dialog bubble without rotation since parent handles it
    this.dialogBubble = new DialogBubble({
      align: 'right',
      rotation: 0,
      style: 'ChatBubble2', // Use alternate chat bubble style
    })
    this.dialogBubble.pos = ex.vec(-35, -25) // Moved to left side
    this.addChild(this.dialogBubble)

    this.addChild(this.detectionZone)
    this.addChild(this.dealer)

    console.log('added dealer')

    // Log final setup
    console.log('Dealer setup complete:', {
      mainActor: {
        pos: this.pos,
        scale: this.scale,
        z: this.z,
      },
      spriteActor: {
        pos: this.dealer.pos,
        scale: this.dealer.scale,
        z: this.dealer.z,
      },
    })
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
