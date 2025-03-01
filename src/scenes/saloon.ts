import {
  Scene,
  Engine,
  Color,
  Actor,
  vec,
  CollisionType,
  CircleCollider,
} from 'excalibur'
import { Player } from '../actors/player'
import { UIManager } from '../ui/UIManager'
import { GameUI } from '../ui/gameUI'
import { ShopKeeper } from '../actors/shopkeeper'
import { Resources } from '../resources'
import { Dealer } from '../actors/dealer'

export class Saloon extends Scene {
  private player!: Player
  private gameUI: GameUI = GameUI.getInstance()
  private walls: Actor[] = []
  private door!: Actor
  private shopkeeper!: ShopKeeper
  private tables: Actor[] = []
  private dealer!: Dealer

  public onInitialize(engine: Engine) {
    this.backgroundColor = Color.fromHex('#785124')
    this.gameUI = GameUI.getInstance()

    // Initialize actors with temporary positions (will be updated in onActivate)
    this.walls = this.createWalls(engine)
    this.walls.forEach((wall) => this.add(wall))

    this.door = new Actor({
      width: 80,
      height: 20,
      z: 1,
      color: Color.fromHex('#754814'),
    })
    this.door.on('collisionstart', (evt) => {
      if (evt.other.owner instanceof Player) {
        engine.goToScene('Town')
      }
    })
    this.add(this.door)

    // Initialize player and shopkeeper
    this.player = new Player({ pos: vec(0, 0) }) // Position will be set in onActivate
    this.player.scale = vec(1.5, 1.5)
    this.add(this.player)

    this.shopkeeper = new ShopKeeper(vec(0, 0)) // Position will be set in onActivate
    this.add(this.shopkeeper)

    this.dealer = new Dealer(vec(0, 0))

    // Create tables with chair children
    for (let i = 0; i < 3; i++) {
      const table = new Actor({
        width: 140,
        height: 140,
        color: Color.fromHex('#8B4513'),
        collisionType: CollisionType.Fixed,
        //@ts-ignore - Excalibur.js types are missing PolygonCollider
        collider: new CircleCollider({
          radius: 60,
          offset: vec(0, 0),
        }),
        z: -1,
      })
      table.graphics.use(
        Resources.Table.toSprite({
          scale: vec(0.25, 0.25),
        })
      )

      this.tables.push(table)
      this.add(table)

      // Create 4 chairs for each table with positions and rotations
      const chairOffset = 70
      const chairConfigs = [
        { pos: vec(0, -chairOffset), rotation: Math.PI }, // Top chair faces down
        { pos: vec(chairOffset, 0), rotation: -Math.PI / 2 }, // Right chair faces left
        { pos: vec(0, chairOffset), rotation: 0 }, // Bottom chair faces up
        { pos: vec(-chairOffset, 0), rotation: Math.PI / 2 }, // Left chair faces right
      ]

      chairConfigs.forEach(({ pos, rotation }) => {
        const chair = new Actor({
          width: 45,
          height: 45,
          color: Color.fromHex('#A0522D'),
          collisionType: CollisionType.Fixed,
          pos: pos,
          rotation: rotation,
          z: -1,
        })
        chair.graphics.use(
          Resources.Chair.toSprite({
            scale: vec(0.2, 0.2),
          })
        )

        table.addChild(chair)
      })
    }

    this.tables[0].children[0].addChild(this.dealer)
  }

  private createWalls(engine: Engine): Actor[] {
    return [
      new Actor({
        // Top wall
        width: 100, // base width
        height: 20,
        color: Color.Brown,
        collisionType: CollisionType.Fixed,
      }),
      new Actor({
        // Bottom wall
        width: 100, // base width
        height: 20,
        color: Color.Brown,
        collisionType: CollisionType.Fixed,
      }),
      new Actor({
        // Left wall
        width: 20,
        height: 100, // base height
        color: Color.Brown,
        collisionType: CollisionType.Fixed,
      }),
      new Actor({
        // Right wall
        width: 20,
        height: 100, // base height
        color: Color.Brown,
        collisionType: CollisionType.Fixed,
      }),
    ]
  }

  public onActivate(context?: any) {
    // Get current screen dimensions
    const screenWidth = this.engine.screen.resolution.width
    const screenHeight = this.engine.screen.resolution.height
    const center = this.engine.screen.center

    // Update camera position
    this.camera.pos = center

    // Update wall positions and scales
    const [topWall, bottomWall, leftWall, rightWall] = this.walls

    topWall.pos = vec(center.x, 0)
    topWall.scale = vec(screenWidth / 100, 1) // scale based on base width

    bottomWall.pos = vec(center.x, screenHeight)
    bottomWall.scale = vec(screenWidth / 100, 1)

    leftWall.pos = vec(0, center.y)
    leftWall.scale = vec(1, screenHeight / 100) // scale based on base height

    rightWall.pos = vec(screenWidth, center.y)
    rightWall.scale = vec(1, screenHeight / 100)

    // Update door position
    this.door.pos = vec(center.x, screenHeight - 10)

    // Update player position
    this.player.pos = vec(center.x, screenHeight - 60)

    // Update shopkeeper position
    this.shopkeeper.pos = vec(center.x - 300, center.y)

    // Position dealer at one of the card table chairs
    // const cardTable = this.tables[0]
    // const dealerChair = cardTable.children[0] as Actor
    // console.log('Card table position:', cardTable.pos)
    // console.log('Dealer chair local position:', dealerChair.pos)

    // // Calculate world position by adding parent positions
    // const chairWorldPos = vec(
    //   cardTable.pos.x + dealerChair.pos.x,
    //   cardTable.pos.y + dealerChair.pos.y
    // )
    // this.dealer.pos = chairWorldPos
    // console.log('Set dealer position to:', this.dealer.pos)

    // // Make sure dealer is visible and properly scaled
    // this.dealer.z = 2
    // console.log('Dealer properties:', {
    //   position: this.dealer.pos,
    //   scale: this.dealer.scale,
    //   z: this.dealer.z,
    // })

    this.tables[0].pos = vec(center.x + 250, center.y - 150)
    this.tables[0].graphics.use(
      Resources.CardTable.toSprite({
        scale: vec(0.25, 0.25),
      })
    )
    this.tables[1].pos = vec(center.x, center.y)
    this.tables[1].rotation = 45
    this.tables[2].pos = vec(center.x + 250, center.y + 150)
    this.tables[2].rotation = -28
    ;(this.tables[0].children[0] as Actor).pos = vec(0, -80)

    // Update UI
    const ui = UIManager.getInstance()
    ui.setScene('Saloon')
    this.gameUI.showGameUI()
    this.gameUI.hideWaveUI()

    // Load player state
    this.player.loadHealthState()
    this.player.loadAmmoState()
    this.player.loadTokens()
  }
}
