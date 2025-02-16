import { Scene, Engine, Color, Actor, vec, CollisionType } from 'excalibur'
import { Player } from '../actors/player'
import { UIManager } from '../ui/UIManager'
import { GameUI } from '../ui/gameUI'
import { ShopKeeper } from '../actors/shopkeeper'

export class Saloon extends Scene {
  private player: Player
  private gameUI: GameUI = GameUI.getInstance()
  /**
   * Start-up logic, called once
   */
  public onInitialize(engine: Engine) {
    this.backgroundColor = Color.fromHex('#8B4513') // brown background
    this.gameUI = GameUI.getInstance()

    // Get screen dimensions
    const screenWidth = engine.screen.resolution.width
    const screenHeight = engine.screen.resolution.height
    const center = engine.screen.center

    // Create walls scaled to screen
    const walls = [
      // Top wall
      new Actor({
        pos: vec(center.x, 0),
        width: screenWidth,
        height: 20,
        color: Color.Brown,
        collisionType: CollisionType.Fixed,
      }),
      // Bottom wall
      new Actor({
        pos: vec(center.x, screenHeight),
        width: screenWidth,
        height: 20,
        color: Color.Brown,
        collisionType: CollisionType.Fixed,
      }),
      // Left wall
      new Actor({
        pos: vec(0, center.y),
        width: 20,
        height: screenHeight,
        color: Color.Brown,
        collisionType: CollisionType.Fixed,
      }),
      // Right wall
      new Actor({
        pos: vec(screenWidth, center.y),
        width: 20,
        height: screenHeight,
        color: Color.Brown,
        collisionType: CollisionType.Fixed,
      }),
    ]

    // Door to town at bottom center
    const door = new Actor({
      pos: vec(center.x, screenHeight - 10),
      width: 80,
      height: 20,
      z: 1,
      color: Color.fromHex('#472a00'),
    })

    door.on('collisionstart', (evt) => {
      console.log(evt)
      if (evt.other.owner instanceof Player) {
        console.log('I got collision with player')
        engine.goToScene('Town')
      }
    })

    // Add player at center of screen
    this.player = new Player({ pos: vec(center.x, screenHeight - 60) })
    this.player.scale = vec(1.5, 1.5)
    this.add(this.player)
    walls.forEach((wall) => this.add(wall))
    this.add(door)

    // Add shopkeeper
    const shopkeeper = new ShopKeeper(vec(center.x - 300, center.y))
    this.add(shopkeeper)
  }

  public onActivate() {
    this.camera.pos = this.engine.screen.center

    const ui = UIManager.getInstance()
    ui.setScene('Saloon')

    // Show persistent UI
    this.gameUI.showGameUI()

    // Load player state
    this.player.loadHealthState()
    this.player.loadAmmoState()
    this.player.loadTokens()

    // Hide wave-specific UI
    this.gameUI.hideWaveUI()
  }
}
