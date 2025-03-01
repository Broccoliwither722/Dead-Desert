import { Actor, ActorArgs } from 'excalibur'
import { Player } from './player'
import { Zombie } from './zombie'

export type HiredActorConfig = ActorArgs & {
  player: Player
}

export abstract class HiredActor extends Actor {
  protected player: Player
  protected detectionRange = 500

  constructor({ player, ...config }: HiredActorConfig) {
    super(config)
    this.player = player
  }

  abstract performAction(): void

  // Common helper behavior methods
  protected followPlayer(): void {
    // Implementation
  }

  protected findNearestZombie(zombies: Zombie[]): Zombie | null {
    let nearest: Zombie | null = null
    let shortestDistance = this.detectionRange

    zombies.forEach((zombie) => {
      const distance = this.pos.distance(zombie.pos)
      if (distance < shortestDistance) {
        shortestDistance = distance
        nearest = zombie
      }
    })

    return nearest
  }
}
