import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Player } from '../../src/actors/player'
import * as ex from 'excalibur'

// Mock GameUI
vi.mock('../../src/ui/gameUI', () => ({
  GameUI: {
    getInstance: vi.fn(() => ({
      updateHealthBar: vi.fn(),
      updateAmmoUI: vi.fn(),
      updateTokenCount: vi.fn(),
    })),
  },
}))

describe('Player', () => {
  let player: Player

  beforeEach(() => {
    // Create a player
    player = new Player({ pos: ex.vec(100, 100) })

    // Mock localStorage methods
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => null)
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
  })

  it('should initialize with default health', () => {
    expect(player.health).toBeGreaterThan(0)
  })

  it('should take damage correctly', () => {
    const initialHealth = player.health
    player.damage(3)
    expect(player.health).toBe(initialHealth - 3)
  })

  it('should not have health below 0', () => {
    player.damage(100) // Try to deal massive damage
    expect(player.health).toBe(0)
  })

  it('should heal correctly', () => {
    player.damage(5)
    const damagedHealth = player.health
    player.heal(2)
    expect(player.health).toBe(damagedHealth + 2)
  })

  it('should add tokens correctly', () => {
    const initialTokens = player.getTokens()
    player.addTokens(5)
    expect(player.getTokens()).toBe(initialTokens + 5)
  })
})
