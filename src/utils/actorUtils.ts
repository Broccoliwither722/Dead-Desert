import * as ex from 'excalibur'
import { Player } from '../actors/player'

// Create the spawnable and player groups first
export const spawnableGroup = ex.CollisionGroupManager.create('spawnable')
export const playerGroup = ex.CollisionGroupManager.create('player')

// Create a temporary zombie group to get its category
const tempZombieGroup = ex.CollisionGroupManager.create('zombie-temp')
// Then create the real zombie group with a mask that includes itself
export const zombieGroup = ex.CollisionGroupManager.create(
  'zombie',
  tempZombieGroup.category | ~0 // This makes zombies collide with themselves and everything else
)

export function findPlayer(scene: ex.Scene): Player {
  const actor = scene.actors.find((actor) => actor instanceof Player)
  if (!actor) {
    throw new Error('Player not found in scene')
  }
  return actor as unknown as Player
}
