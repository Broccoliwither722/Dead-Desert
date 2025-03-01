import * as ex from 'excalibur'
import { Player } from '../actors/player'
import { Gunslinger } from '../actors/gunslinger'

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
  hirePrice: number
  createActor: (scene: ex.Scene, player: Player) => ex.Actor
  isActiveThisWave?: boolean
}

export class ShopSystem {
  private static instance: ShopSystem
  private purchasedItems: Set<string> = new Set()
  private activeHires: Set<string> = new Set()
  private activeActors: Map<string, ex.Actor> = new Map()

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
      createActor: (scene: ex.Scene, player: Player) => {
        const center = scene.engine.screen.center
        return new Gunslinger(ex.vec(center.x + 150, 200), player)
      },
      apply: () => {}, // Initial unlock effect if needed
    },
  ]

  private combinedItems: ShopItem[] = [...this.items, ...this.hireItems]

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
    const item = this.combinedItems.find((i) => i.id === itemId)
    if (!item) return false

    if (item.oneTime && this.purchasedItems.has(itemId)) {
      return false
    }

    return player.getTokens() >= item.cost
  }

  public purchaseItem(itemId: string, player: Player): boolean {
    const item = this.combinedItems.find((i) => i.id === itemId)
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
    if (!item || !this.isPurchased(id)) return false

    if (player.getTokens() >= item.hirePrice) {
      player.spendTokens(item.hirePrice)

      this.activeHires.add(id)
      item.isActiveThisWave = true
      this.savePurchases()
      return true
    }
    return false
  }

  public isActiveHire(id: string): boolean {
    return this.activeHires.has(id)
  }

  private savePurchases(): void {
    localStorage.setItem(
      'shopPurchases',
      JSON.stringify(Array.from(this.purchasedItems))
    )
    localStorage.setItem(
      'activeHires',
      JSON.stringify(Array.from(this.activeHires))
    )
  }

  private loadPurchases(): void {
    const savedPurchases = localStorage.getItem('shopPurchases')
    if (savedPurchases) {
      this.purchasedItems = new Set(JSON.parse(savedPurchases))
    }

    const savedHires = localStorage.getItem('activeHires')
    if (savedHires) {
      this.activeHires = new Set(JSON.parse(savedHires))
      // Restore isActiveThisWave state for hired items
      this.hireItems.forEach((item) => {
        item.isActiveThisWave = this.activeHires.has(item.id)
      })
    }
  }

  public reset(): void {
    this.purchasedItems.clear()
    this.activeHires.clear()
    localStorage.removeItem('shopPurchases')
    localStorage.removeItem('activeHires')
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

  public onWaveEnd(scene: ex.Scene): void {
    // Remove all active hired actors from the scene
    this.activeActors.forEach((actor) => {
      if (actor.scene) {
        actor.kill()
      }
    })
    this.activeActors.clear()
    this.activeHires.clear()
    this.hireItems.forEach((item) => {
      item.isActiveThisWave = false
    })
    this.savePurchases()
  }

  public onWaveStart(scene: ex.Scene): void {
    const player = scene.actors.find((a): a is Player => a instanceof Player)
    if (!player) return

    // Load saved hires and create their actors
    this.activeHires.forEach((hireId) => {
      const item = this.hireItems.find((i) => i.id === hireId)
      if (item && item.createActor) {
        const actor = item.createActor(scene, player)
        scene.add(actor)
        this.activeActors.set(item.id, actor)
        item.isActiveThisWave = true
      }
    })
  }
}
