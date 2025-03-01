import * as ex from 'excalibur'
import { Town } from './scenes/town'
import { Saloon } from './scenes/saloon'
import { GameOver } from './scenes/gameOver'
import { Resources } from './resources'
import { OnScreenControls } from './systems/onScreenControls'
import { GameUI } from './ui/gameUI'

const game = new ex.Engine({
  canvasElementId: 'game',
  pointerScope: ex.PointerScope.Canvas,
  backgroundColor: ex.Color.fromHex('#54C0CA'),
  // displayMode: ex.DisplayMode.FitScreenAndFill,
  // displayMode: ex.DisplayMode.FillScreen,
  // displayMode: ex.DisplayMode.FillContainer,
  // pixelRatio: 2,
  // Set the display mode differently if on mobile, to fit the screen on mobile, and FillScreen on desktop
  displayMode:
    window.innerWidth < 800 || window.innerHeight < 800
      ? ex.DisplayMode.FitScreenAndFill
      : ex.DisplayMode.FillScreen,
  antialiasing: true,
})

// Add debounced resize handler
let resizeTimeout: number
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const currentScene = game.currentScene
    if (currentScene) {
      // Force scene reinitialization
      const context = {
        engine: game,
        previousScene: currentScene,
        nextScene: currentScene,
      }
      currentScene.onDeactivate(context)
      currentScene.onActivate(context)

      // Ensure mobile controls are visible and properly positioned
      mobileControls.hide()
      mobileControls.show()
    }
  }, 250)
}

// Add event listeners
window.addEventListener('resize', handleResize)
window.addEventListener('orientationchange', handleResize)

// Center the camera for all scenes
game.screen.setCurrentCamera(new ex.Camera())

const loader = new ex.Loader(
  Object.keys(Resources).map((key) => Resources[key as keyof typeof Resources])
)

// Initialize UI before scenes with engine reference
const gameUI = GameUI.initialize(game)
const mobileControls = OnScreenControls.getInstance()
gameUI.initialize()

const town = new Town()
const saloon = new Saloon()
const gameOver = new GameOver()

game.addScene('Town', town)
game.addScene('Saloon', saloon)
game.addScene('GameOver', gameOver)

game.start(loader).then(() => {
  // game.goToScene('Town')
  game.goToScene('Saloon')
  mobileControls.show()
})

game.start()
