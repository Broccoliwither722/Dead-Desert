import { Scene, Engine, Color, Actor, vec, CollisionType } from 'excalibur'
import { Player } from '../actors/player'
import { UIManager } from '../ui/UIManager'
import { GameUI } from '../ui/gameUI'
import { ShopKeeper } from '../actors/shopkeeper'

export class Saloon extends Scene {
  private player: Player
  private gameUI: GameUI = GameUI.getInstance()
  private walls: Actor[] = []
  private door: Actor
  private shopkeeper: ShopKeeper

  public onInitialize(engine: Engine) {
    this.backgroundColor = Color.fromHex('#8B4513')
    this.gameUI = GameUI.getInstance()

    // Initialize actors with temporary positions (will be updated in onActivate)
    this.walls = this.createWalls(engine)
    this.walls.forEach((wall) => this.add(wall))

    this.door = new Actor({
      width: 80,
      height: 20,
      z: 1,
      color: Color.fromHex('#472a00'),
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
