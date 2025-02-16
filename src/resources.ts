// resources.ts
import * as ex from 'excalibur'

export const Resources = {
  // Relative to /public in vite
  playerIdle: new ex.ImageSource('/textures/Idle.svg'),
  playerOneGun: new ex.ImageSource('/textures/GunIdle.svg'),

  zombieSprite: new ex.ImageSource('/textures/Zombie.svg'),
  zombieDeathSprite: new ex.ImageSource('/textures/DeadZombie.svg'),

  shopkeeper: new ex.ImageSource('/textures/Shopkeeper.svg'),
} as const
