import * as ex from 'excalibur'
import { AmmoBox } from '../actors/ammoBox'
import { Healthpack } from '../actors/healthpack'
import { Building } from '../actors/building'
import { Cactus } from '../actors/cactus'
import { Player } from '../actors/player'

export class SpawnController {
  private scene: ex.Scene
  private spawnAmmoTimer: number = 0
  private spawnHealthTimer: number = 0
  private readonly AMMO_SPAWN_INTERVAL = 30000 // 30 seconds
  private readonly HEALTH_SPAWN_INTERVAL = 60000 // 30 seconds

  constructor(scene: ex.Scene) {
    this.scene = scene
  }

  public update(delta: number, isWaveActive: boolean): void {
    if (!isWaveActive) return

    this.spawnAmmoTimer += delta
    if (this.spawnAmmoTimer >= this.AMMO_SPAWN_INTERVAL) {
      this.spawnAmmoTimer = 0
      this.spawnActor(AmmoBox)
    }
    this.spawnHealthTimer += delta
    if (this.spawnHealthTimer >= this.HEALTH_SPAWN_INTERVAL) {
      this.spawnHealthTimer = 0
      this.spawnActor(Healthpack)
    }
  }

  private spawnActor(ActorType: typeof ex.Actor): void {
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
        this.scene.add(new ActorType({ pos: testPos }))
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
      //@ts-ignore - Excalibur.js types are missing PolygonCollider
      collider: ex.Shape.Box(36, 36),
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
