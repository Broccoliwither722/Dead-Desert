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
  // width: 800,
  // height: 600,
  backgroundColor: ex.Color.fromHex('#54C0CA'),
  // displayMode: ex.DisplayMode.FitScreenAndFill,
  // displayMode: ex.DisplayMode.FillScreen,
  // displayMode: ex.DisplayMode.FillContainer,
  // pixelRatio: 2,
  // Set the display mode differently if on mobile, to fit the screen on mobile, and FillScreen on desktop
  displayMode:
    window.innerWidth < 800
      ? ex.DisplayMode.FitScreenAndFill
      : ex.DisplayMode.FillScreen,
  antialiasing: true,
})

// Center the camera for all scenes
game.screen.setCurrentCamera(new ex.Camera())

const loader = new ex.Loader(Object.values(Resources))

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
