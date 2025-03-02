import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ShopSystem } from '../../src/systems/shopSystem'
import { Player } from '../../src/actors/player'
import * as ex from 'excalibur'

// Mock GameUI
vi.mock('../../src/ui/gameUI', () => ({
  GameUI: {
    getInstance: vi.fn(() => ({
      updateHiredActorsUI: vi.fn(),
      updateTokenCount: vi.fn(),
    })),
  },
}))

describe('ShopSystem', () => {
  let shopSystem: ShopSystem
  let player: Player
  let mockScene: ex.Scene

  beforeEach(() => {
    // Reset localStorage mocks
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => null)
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
    vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {})

    // Get shop system instance
    shopSystem = ShopSystem.getInstance()
    shopSystem.reset() // Reset to clean state

    // Create a mock player with some tokens
    player = new Player({ pos: ex.vec(100, 100) })
    vi.spyOn(player, 'getTokens').mockReturnValue(100) // Give player 100 tokens
    vi.spyOn(player, 'spendTokens').mockImplementation(() => {})

    // Create a mock scene
    mockScene = new ex.Scene()
    mockScene.add(player)
  })

  it('should be a singleton', () => {
    const instance1 = ShopSystem.getInstance()
    const instance2 = ShopSystem.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should have items available for purchase', () => {
    const items = shopSystem.getItems()
    expect(items.length).toBeGreaterThan(0)
  })

  it('should have hire items available', () => {
    const hireItems = shopSystem.getHireItems()
    expect(hireItems.length).toBeGreaterThan(0)
  })

  it('should allow purchasing items if player has enough tokens', () => {
    const ammoBoxId = 'ammo_box'
    const spendTokensSpy = vi.spyOn(player, 'spendTokens')

    const result = shopSystem.purchaseItem(ammoBoxId, player)

    expect(result).toBe(true)
    expect(spendTokensSpy).toHaveBeenCalled()
  })

  it('should track purchased one-time items', () => {
    const vestId = 'bulletproof_vest'

    // Purchase the vest
    shopSystem.purchaseItem(vestId, player)

    // Check if it's marked as purchased
    expect(shopSystem.isPurchased(vestId)).toBe(true)
  })

  it('should clear active hires when wave ends', () => {
    const gunslingerId = 'hire_gunslinger'

    // Purchase and hire
    shopSystem.purchaseItem(gunslingerId, player)
    shopSystem.hireHelper(gunslingerId, player)

    // End the wave
    shopSystem.onWaveEnd(mockScene)

    // Check if active hires were cleared
    expect(shopSystem.isActiveHire(gunslingerId)).toBe(false)
  })
})
