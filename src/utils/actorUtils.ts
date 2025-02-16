import * as ex from 'excalibur'
import { Player } from '../actors/player'

export function findPlayer(scene: ex.Scene): Player {
  const actor = scene.actors.find((actor) => actor instanceof Player)
  if (!actor) {
    throw new Error('Player not found in scene')
  }
  return actor as unknown as Player
}
