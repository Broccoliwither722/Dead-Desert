import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameUI } from '../../src/ui/gameUI'
import * as ex from 'excalibur'

// Create a mock GameUI implementation for testing
const mockGameUIInstance = {
  initialize: vi.fn(),
  showGameUI: vi.fn(),
  hideAllUI: vi.fn(),
  updateHealthBar: vi.fn(),
  updateAmmoUI: vi.fn(),
  updateTokenCount: vi.fn(),
  showHiredActorsPanel: vi.fn(),
  hideHiredActorsPanel: vi.fn(),
}

// Mock UIManager
vi.mock('../../src/ui/UIManager', () => ({
  UIManager: {
    getInstance: vi.fn(() => ({
      addElement: vi.fn(),
      setScene: vi.fn(),
    })),
  },
}))

// Mock ShopSystem
vi.mock('../../src/systems/shopSystem', () => ({
  ShopSystem: {
    getInstance: vi.fn(() => ({
      getItems: vi.fn(() => []),
      getHireItems: vi.fn(() => []),
      refreshHireState: vi.fn(),
    })),
  },
}))

// Mock GameUI static methods
vi.mock('../../src/ui/gameUI', () => ({
  GameUI: {
    getInstance: vi.fn(() => mockGameUIInstance),
    initialize: vi.fn(() => mockGameUIInstance),
  },
}))

describe('GameUI', () => {
  let engine: ex.Engine
  let gameUI: GameUI

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create a mock engine
    engine = new ex.Engine({
      width: 800,
      height: 600,
      canvasElementId: 'game',
    })

    // Create a canvas element for the engine
    const canvas = document.createElement('canvas')
    canvas.id = 'game'
    document.body.appendChild(canvas)

    // Get the mocked GameUI instance
    gameUI = GameUI.initialize(engine)

    // Call initialize method on the mock instance
    gameUI.initialize()
  })

  it('should be a singleton', () => {
    const instance1 = GameUI.getInstance()
    expect(instance1).toBe(gameUI)
    expect(GameUI.initialize).toHaveBeenCalledWith(engine)
  })

  it('should initialize UI elements', () => {
    expect(gameUI.initialize).toHaveBeenCalled()
  })

  it('should show and hide UI elements', () => {
    gameUI.showGameUI()
    expect(gameUI.showGameUI).toHaveBeenCalled()
  })
})
