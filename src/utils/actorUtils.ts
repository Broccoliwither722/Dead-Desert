import * as ex from 'excalibur'
import { Player } from '../actors/player'

export const spawnableGroup = ex.CollisionGroupManager.create('spawnable')
export const playerGroup = ex.CollisionGroupManager.create('player')
export const zombieGroup = ex.CollisionGroupManager.create('zombie')

export function findPlayer(scene: ex.Scene): Player {
  const actor = scene.actors.find((actor) => actor instanceof Player)
  if (!actor) {
    throw new Error('Player not found in scene')
  }
  return actor as unknown as Player
}
