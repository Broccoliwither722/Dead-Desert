import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import * as ex from 'excalibur'

// Mock Excalibur engine and components
// Mock canvas and WebGL context
beforeAll(() => {
  // Mock canvas
  global.HTMLCanvasElement.prototype.getContext = vi
    .fn()
    .mockImplementation((contextType: string) => {
      return {
        // Mock methods
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => new Uint8Array(4)),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => []),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        translate: vi.fn(),
        transform: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),

        // Add required properties
        canvas: new HTMLCanvasElement(),
        direction: 'ltr',
        fillStyle: '',
        font: '10px sans-serif',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'low',
        lineCap: 'butt',
        lineDashOffset: 0,
        lineJoin: 'miter',
        lineWidth: 1,
        miterLimit: 10,
        shadowBlur: 0,
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        strokeStyle: '',
        textAlign: 'start',
        textBaseline: 'alphabetic',

        // Additional required methods
        measureText: vi.fn(() => ({ width: 0 })),
        createLinearGradient: vi.fn(() => ({})),
        createRadialGradient: vi.fn(() => ({})),
        createPattern: vi.fn(() => ({})),
        arc: vi.fn(),
        arcTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        ellipse: vi.fn(),
        isPointInPath: vi.fn(() => false),
        isPointInStroke: vi.fn(() => false),
        quadraticCurveTo: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        getLineDash: vi.fn(() => []),
        setLineDash: vi.fn(),
        getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
        resetTransform: vi.fn(),
        drawFocusIfNeeded: vi.fn(),
        scrollPathIntoView: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
      } as unknown as CanvasRenderingContext2D
    })

  // Mock localStorage
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  }

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 0))
  global.cancelAnimationFrame = vi.fn()

  // Mock Excalibur engine and scene
  vi.mock('excalibur', async () => {
    const actual = await vi.importActual('excalibur')
    return {
      ...actual,
      Engine: vi.fn().mockImplementation(() => ({
        drawWidth: 1000,
        drawHeight: 800,
        currentScene: {
          add: vi.fn(),
          world: {
            add: vi.fn(),
            remove: vi.fn(),
          },
        },
        goToScene: vi.fn(),
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn(),
        add: vi.fn(),
        remove: vi.fn(),
      })),
      Scene: vi.fn().mockImplementation(() => ({
        add: vi.fn(),
        engine: null,
        world: {
          add: vi.fn(),
          remove: vi.fn(),
          collisionGroupManager: { getGroup: vi.fn().mockReturnValue(1) },
        },
      })),
    }
  })

  // Mock GameUI singleton
  vi.mock('../src/ui/gameUI', () => ({
    GameUI: {
      getInstance: vi.fn().mockImplementation(() => ({
        updateAmmoUI: vi.fn(),
        updateHealthBar: vi.fn(),
        updateTokenCounter: vi.fn(),
        // Add other GameUI methods used in tests
      })),
    },
  }))

  // Initialize collision groups for tests
  const { CollisionGroupManager } = ex
  CollisionGroupManager.reset()
  CollisionGroupManager.create('spawnables')
  CollisionGroupManager.create('players')
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  document.body.innerHTML = ''
})
