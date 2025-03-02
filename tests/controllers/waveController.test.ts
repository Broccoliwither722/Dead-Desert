import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WaveController } from '../../src/controllers/waveController'
import * as ex from 'excalibur'

// Mock GameUI
vi.mock('../../src/ui/gameUI', () => ({
  GameUI: {
    getInstance: vi.fn(() => ({
      hideHiredActorsPanel: vi.fn(),
      showHiredActorsPanel: vi.fn(),
    })),
  },
}))

// Mock ShopSystem
vi.mock('../../src/systems/shopSystem', () => ({
  ShopSystem: {
    getInstance: vi.fn(() => ({
      onWaveEnd: vi.fn(),
      onWaveStart: vi.fn(),
    })),
  },
}))

describe('WaveController', () => {
  let waveController: WaveController
  let mockScene: ex.Scene

  beforeEach(() => {
    // Reset localStorage mocks
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => null)
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
    vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {})

    // Create a mock scene
    mockScene = new ex.Scene()

    // Create wave controller
    waveController = new WaveController(mockScene)
  })

  it('should initialize with wave 0', () => {
    expect(waveController.currentWaveNumber).toBe(0)
  })

  it('should not be active initially', () => {
    expect(waveController.isWaveActive).toBe(false)
  })

  it('should increment wave number when starting a wave', () => {
    const initialWave = waveController.currentWaveNumber
    waveController.startWave()
    expect(waveController.currentWaveNumber).toBe(initialWave + 1)
  })

  it('should set wave as active when starting', () => {
    waveController.startWave()
    expect(waveController.isWaveActive).toBe(true)
  })

  it('should reset to wave 0', () => {
    waveController.startWave() // Start wave 1
    waveController.reset()
    expect(waveController.currentWaveNumber).toBe(0)
    expect(waveController.isWaveActive).toBe(false)
  })
})
