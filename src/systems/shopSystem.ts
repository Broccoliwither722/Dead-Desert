import { Player } from '../actors/player'

export interface ShopItem {
  id: string
  name: string
  description: string
  cost: number
  icon: string
  oneTime: boolean
  apply: (player: Player) => void
}

export interface HireItem extends ShopItem {
  hirePrice: number // Cost per wave
}

export class ShopSystem {
  private static instance: ShopSystem
  private purchasedItems: Set<string> = new Set()

  private items: ShopItem[] = [
    {
      id: 'ammo_box',
      name: 'Ammo Box',
      description: '+24 Ammo',
      cost: 10,
      icon: 'textures/AmmoBoxIcon.png',
      oneTime: false,
      apply: (player: Player) => player.addAmmo(24),
    },
    {
      id: 'bandage',
      name: 'Bandage',
      description: '+3 Health',
      cost: 5,
      icon: 'textures/BandageIcon.svg',
      oneTime: false,
      apply: (player: Player) => player.heal(3),
    },
    {
      id: 'bulletproof_vest',
      name: 'Bulletproof Vest',
      description: '+10 Max Health',
      cost: 50,
      icon: 'textures/VestIcon.svg',
      oneTime: true,
      apply: (player: Player) => player.increaseMaxHealth(10),
    },
  ]

  private hireItems: HireItem[] = [
    {
      id: 'hire_gunslinger',
      name: 'Gunslinger',
      description: 'A skilled shooter who helps defend against zombies',
      icon: 'textures/gunslinger-icon.png',
      cost: 75,
      hirePrice: 10,
      oneTime: true,
      apply: (player: Player) => {
        // Implement gunslinger effect
      },
    },
  ]

  private constructor() {
    this.loadPurchases()
  }

  public static getInstance(): ShopSystem {
    if (!ShopSystem.instance) {
      ShopSystem.instance = new ShopSystem()
    }
    return ShopSystem.instance
  }

  public getItems(): ShopItem[] {
    return this.items
  }

  public getHireItems(): HireItem[] {
    return this.hireItems
  }

  public canPurchase(itemId: string, player: Player): boolean {
    const item = this.items.find((i) => i.id === itemId)
    if (!item) return false

    if (item.oneTime && this.purchasedItems.has(itemId)) {
      return false
    }

    return player.getTokens() >= item.cost
  }

  public purchaseItem(itemId: string, player: Player): boolean {
    const item = this.items.find((i) => i.id === itemId)
    if (!item || !this.canPurchase(itemId, player)) return false

    player.spendTokens(item.cost)
    item.apply(player)

    if (item.oneTime) {
      this.purchasedItems.add(itemId)
      this.savePurchases()
    }

    return true
  }

  public isHired(id: string): boolean {
    return this.isPurchased(id)
  }

  public canHire(id: string, player: Player): boolean {
    const item = this.hireItems.find((item) => item.id === id)
    if (!item) return false
    return item.hirePrice <= player.getTokens()
  }

  public hireHelper(id: string, player: Player): boolean {
    const item = this.hireItems.find((item) => item.id === id)
    if (!item || !this.isHired(id)) return false

    if (player.getTokens() >= item.hirePrice) {
      player.spendTokens(item.hirePrice)
      item.apply(player)
      return true
    }
    return false
  }

  private savePurchases(): void {
    localStorage.setItem(
      'shopPurchases',
      JSON.stringify(Array.from(this.purchasedItems))
    )
  }

  private loadPurchases(): void {
    const saved = localStorage.getItem('shopPurchases')
    if (saved) {
      this.purchasedItems = new Set(JSON.parse(saved))
    }
  }

  public reset(): void {
    this.purchasedItems.clear()
    localStorage.removeItem('shopPurchases')
  }

  public applyPurchasedPerks(player: Player): void {
    this.purchasedItems.forEach((itemId) => {
      const item = this.items.find((i) => i.id === itemId)
      if (item) {
        item.apply(player)
      }
    })
  }

  public isPurchased(itemId: string): boolean {
    return this.purchasedItems.has(itemId)
  }
}
