// resources.ts
import * as ex from 'excalibur'

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
  Healthpack: new ex.ImageSource('textures/Healthpack.svg'),
  Cactus: new ex.ImageSource('textures/Cactus.svg'),
  Saloon: new ex.ImageSource('textures/Saloon.svg'),
  Shop: new ex.ImageSource('textures/Shop.svg'),
  Bullet: new ex.ImageSource('textures/Bullet.svg'),
  Chair: new ex.ImageSource('textures/Chair.svg'),
  Table: new ex.ImageSource('textures/Table.svg'),
  CardTable: new ex.ImageSource('textures/CardTable.svg'),
  Dealer: new ex.ImageSource('textures/Dealer.svg'),

  HealthEffect: new ex.ImageSource('textures/HealthEffect.svg'),

  ChatBubble: new ex.ImageSource('textures/ChatBubble.png'),
} as const

export const NineSlices: Record<
  string,
  (width: number, height: number) => ex.NineSlice
> = {
  ChatBubble: (width, height) =>
    new ex.NineSlice({
      width,
      height,
      source: Resources.ChatBubble,
      sourceConfig: {
        width: 126,
        height: 126,
        topMargin: 23,
        bottomMargin: 23,
        leftMargin: 23,
        rightMargin: 23,
      },
      destinationConfig: {
        drawCenter: true,
        horizontalStretch: ex.NineSliceStretch.TileFit,
        verticalStretch: ex.NineSliceStretch.Stretch,
      },
    }),
}
