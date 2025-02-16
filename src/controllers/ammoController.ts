import * as ex from 'excalibur'
import { AmmoBox } from '../actors/ammoBox'
import { Building } from '../actors/building'
import { Cactus } from '../actors/cactus'
import { Player } from '../actors/player'

export class AmmoController {
  private scene: ex.Scene
  private spawnTimer: number = 0
  private readonly SPAWN_INTERVAL = 30000 // 30 seconds

  constructor(scene: ex.Scene) {
    this.scene = scene
  }

  public update(delta: number, isWaveActive: boolean): void {
    if (!isWaveActive) return

    this.spawnTimer += delta
    if (this.spawnTimer >= this.SPAWN_INTERVAL) {
      this.spawnTimer = 0
      this.spawnAmmoBox()
    }
  }

  private spawnAmmoBox(): void {
    const center = this.scene.engine.screen.center
    let attempts = 0
    let validPosition = false

    while (!validPosition && attempts < 50) {
      const testPos = ex.vec(
        center.x + (Math.random() * 600 - 300),
        center.y + (Math.random() * 600 - 300)
      )

      if (this.isValidSpawnPosition(testPos)) {
        validPosition = true
        this.scene.add(new AmmoBox(testPos))
      }

      attempts++
    }
  }

  private isValidSpawnPosition(position: ex.Vector): boolean {
    const testBox = new ex.Actor({
      pos: position,
      width: 12,
      height: 36,
      collisionType: ex.CollisionType.Passive,
      collider: ex.Shape.Box(12, 36),
    })

    return !this.scene.actors.some(
      (actor) =>
        (actor instanceof Building ||
          actor instanceof Cactus ||
          actor instanceof Player) &&
        testBox.collider.bounds.overlaps(actor.collider.bounds)
    )
  }
}
