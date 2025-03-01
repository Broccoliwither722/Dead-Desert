import { Scene } from 'excalibur'
import { Town } from './town'
import { UIManager } from '../ui/UIManager'
import { ShopSystem } from '../systems/shopSystem'

export class GameOver extends Scene {
  container!: HTMLElement

  public onActivate() {
    // Get the ShopSystem instance and reset it
    const shopSystem = ShopSystem.getInstance()
    shopSystem.reset()

    // Clear saved ammo and wave on game over
    localStorage.removeItem('playerAmmo')
    localStorage.removeItem('playerHealth')
    localStorage.removeItem('playerTokens')
    localStorage.removeItem('currentWave')
    // These are now handled by shopSystem.reset(), but keeping them for clarity
    localStorage.removeItem('shopPurchases')
    localStorage.removeItem('activeHires')

    const ui = UIManager.getInstance()
    ui.setScene('GameOver')

    this.container = document.createElement('div')
    this.container.className = 'game-over-container'

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

    this.container.appendChild(gameOverText)
    this.container.appendChild(restartButton)
    ui.addElement(this.container)
  }

  public onDeactivate() {
    this.container.remove()
    // UIManager.getInstance().clearUI()
  }
}
