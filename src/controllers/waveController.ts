import * as ex from 'excalibur'
import { Zombie } from '../actors/zombie'
import { Resources } from '../resources'
import { EventEmitter } from 'excalibur'

export class WaveController extends EventEmitter {
  private currentWave: number = 0
  private zombiesAlive: number = 0
  private waveActive: boolean = false
  private scene: ex.Scene

  // Add events enum
  public static readonly Events = {
    WaveCompleted: 'wavecompleted',
  } as const

  constructor(scene: ex.Scene) {
    super()
    this.scene = scene
    this.loadSavedWave()
  }

  public get isWaveActive(): boolean {
    return this.waveActive
  }

  public get currentWaveNumber(): number {
    return this.currentWave
  }

  public get remainingZombies(): number {
    return this.zombiesAlive
  }

  private loadSavedWave() {
    const savedWave = localStorage.getItem('currentWave')
    if (savedWave) {
      this.currentWave = parseInt(savedWave)
    }
  }

  public startWave(): void {
    if (this.waveActive) return

    this.currentWave++
    this.zombiesAlive = this.currentWave * 3
    this.waveActive = true

    for (let i = 0; i < this.zombiesAlive; i++) {
      this.spawnZombie()
    }
  }

  private spawnZombie(): void {
    const randomX = Math.random() * this.scene.engine.drawWidth
    const baseY = this.scene.engine.drawHeight + 50
    const randomY = baseY + (Math.random() * 600 - 100)

    const zombie = new Zombie({
      health: Math.ceil(this.currentWave / 10),
      speed: 50 + this.currentWave * 5,
      sprite: Resources.zombieSprite.toSprite(),
      deathSprite: Resources.zombieDeathSprite.toSprite(),
      pos: ex.vec(randomX, randomY),
      strength: 1 + Math.ceil(this.currentWave / 50),
    })

    zombie.once('kill', () => {
      if (!zombie.dead) return
      this.zombiesAlive--
      if (this.zombiesAlive <= 0) {
        this.completeWave()
      }
    })

    this.scene.add(zombie)
  }

  private completeWave(): void {
    localStorage.setItem('currentWave', this.currentWave.toString())
    this.waveActive = false
    // Emit wave completed event
    this.emit(WaveController.Events.WaveCompleted, {
      waveNumber: this.currentWave,
    })
  }

  public reset(): void {
    this.currentWave = 0
    this.zombiesAlive = 0
    this.waveActive = false
    localStorage.removeItem('currentWave')
  }
}
