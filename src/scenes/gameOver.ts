import { Scene } from 'excalibur'
import { Town } from './town'
import { UIManager } from '../ui/UIManager'

export class GameOver extends Scene {
  public onActivate() {
    // Clear saved ammo and wave on game over
    localStorage.removeItem('playerAmmo')
    localStorage.removeItem('currentWave')

    const ui = UIManager.getInstance()
    ui.setScene('GameOver')

    const container = document.createElement('div')
    container.className = 'game-over-container'

    const gameOverText = document.createElement('h1')
    gameOverText.textContent = 'GAME OVER'
    gameOverText.className = 'game-over-text'

    const restartButton = document.createElement('div')
    restartButton.textContent = 'Restart Game'
    restartButton.className = 'restart button'
    restartButton.onclick = () => {
      // Reset the town scene
      const town = this.engine.scenes['Town'] as Town
      town.reset()

      // Go to town scene (which will trigger its onActivate)
      this.engine.goToScene('Saloon')
    }

    container.appendChild(gameOverText)
    container.appendChild(restartButton)
    ui.addElement(container)
  }

  public onDeactivate() {
    UIManager.getInstance().clearUI()
  }
}
