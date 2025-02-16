// resources.ts
import * as ex from 'excalibur'
import { AmmoBox } from './actors/ammoBox'
import { Cactus } from './actors/cactus'

export const Resources = {
  // Relative to /public in vite
  playerIdle: new ex.ImageSource('textures/Idle.svg'),
  playerOneGun: new ex.ImageSource('textures/GunIdle.svg'),

  zombieSprite: new ex.ImageSource('textures/Zombie.svg'),
  zombieDeathSprite: new ex.ImageSource('textures/DeadZombie.svg'),
  ArmoredZombie: new ex.ImageSource('textures/ArmoredZombie.svg'),
  ArmoredZombieDeath: new ex.ImageSource('textures/DeadArmoredZombie.svg'),

  shopkeeper: new ex.ImageSource('textures/Shopkeeper.svg'),
  AmmoBox: new ex.ImageSource('textures/AmmoBoxIcon.png'),
  Cactus: new ex.ImageSource('textures/Cactus.svg'),
} as const
