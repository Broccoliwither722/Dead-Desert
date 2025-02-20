import * as ex from 'excalibur'
import { Player } from '../actors/player'
import { Zombie } from '../actors/zombie'
import { Building } from '../actors/building'
import { Cactus } from '../actors/cactus'
import { WaveController } from '../controllers/waveController'
import { SpawnController } from '../controllers/spawnController'
import { GameUI } from '../ui/gameUI'
import { UIManager } from '../ui/UIManager'
import { SandBackground } from '../actors/sandBackground'
import { Gunslinger } from '../actors/gunslinger'
import { ShopSystem } from '../systems/shopSystem'

export class Town extends ex.Scene {
  private waveController: WaveController
  private spawnController: SpawnController
  private gameUI: GameUI = GameUI.getInstance()
  private player: Player
  private initialPlayerPos: ex.Vector
  private sandBackground: SandBackground

  public onInitialize(engine: ex.Engine) {
    // Add sand background
    this.sandBackground = new SandBackground(
      engine.screen.drawWidth,
      engine.screen.drawHeight
    )
    this.add(this.sandBackground)

    this.waveController = new WaveController(this)
    this.spawnController = new SpawnController(this)

    this.waveController.on(WaveController.Events.WaveCompleted, () => {
      ShopSystem.getInstance().onWaveEnd(this)
      this.gameUI.setupWaveUI(this.waveController.currentWaveNumber + 1, () =>
        this.startWave()
      )
    })

    const center = engine.screen.center
    this.initialPlayerPos = ex.vec(center.x, 90)
    this.setupScene(center)
  }

  private setupScene(center: ex.Vector) {
    // Add player
    this.player = new Player({ numberOfGuns: 1, pos: this.initialPlayerPos })
    this.add(this.player)

    // Add saloon
    const saloon = new Building({
      width: 270,
      height: 55,
      pos: ex.vec(center.x, 30),
      color: ex.Color.Brown,
      targetScene: 'Saloon',
      doorPosition: 'south',
    })
    this.add(saloon)

    // Add cacti
    this.setupCacti(center)
  }

  private setupCacti(center: ex.Vector) {
    const positions = [
      [-300, -150],
      [300, -150],
      [-300, 150],
      [300, 150],
      [0, 200],
      [0, 100],
    ]

    positions.forEach(([x, y]) => {
      this.add(new Cactus(ex.vec(center.x + x, center.y + y)))
    })
  }

  public onActivate() {
    this.camera.pos = this.engine.screen.center

    const ui = UIManager.getInstance()
    ui.setScene('Town')

    // Show persistent UI
    this.gameUI.showGameUI()

    // Load player state
    this.player.loadHealthState()
    this.player.loadAmmoState()
    this.player.loadTokens()
    this.sandBackground.positionWalls(this.engine)

    // Setup wave UI
    this.gameUI.setupWaveUI(this.waveController.currentWaveNumber + 1, () =>
      this.startWave()
    )
  }

  private startWave(): void {
    if (this.waveController.isWaveActive) return
    ShopSystem.getInstance().onWaveStart(this)
    this.waveController.startWave()
    this.gameUI.hideWaveUI()
    this.gameUI.showZombieTracker()
  }

  onPreUpdate(_engine: ex.Engine, delta: number) {
    this.spawnController.update(delta, this.waveController.isWaveActive)
    this.gameUI.updateZombieCount(this.waveController.remainingZombies)
  }

  public reset(): void {
    this.waveController.reset()
    this.player.reset()
    this.player.pos = this.initialPlayerPos
    ShopSystem.getInstance().onWaveEnd(this)
    // Kill all zombies
    this.actors.forEach((actor) => {
      if (actor instanceof Zombie) {
        actor.kill()
      }
    })
    this.gameUI.hideWaveUI()
    this.gameUI.showGameUI()
  }
}
