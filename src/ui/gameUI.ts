import { UIManager } from './UIManager'
import { Player } from '../actors'
import { ShopItem, ShopSystem } from '../systems/shopSystem'
import { findPlayer } from '../utils/actorUtils'
import { HireItem } from '../systems/shopSystem'

export class GameUI {
  private static instance: GameUI
  private uiManager: UIManager
  private engine: ex.Engine
  private waveButton: HTMLDivElement | null = null
  private zombieTracker: HTMLDivElement | null = null
  private healthBar: HTMLDivElement | null = null
  private ammoCounter: HTMLDivElement | null = null
  private reloadPrompt: HTMLDivElement | null = null
  private tokenCounter: HTMLDivElement | null = null
  private shopMenu: HTMLDivElement | null = null
  private hireMenu: HTMLDivElement | null = null
  private uiCreated: boolean = false

  private constructor(engine: ex.Engine) {
    this.engine = engine
    this.uiManager = UIManager.getInstance()
  }

  public static initialize(engine: ex.Engine): GameUI {
    if (!GameUI.instance) {
      GameUI.instance = new GameUI(engine)
    }
    return GameUI.instance
  }

  public static getInstance(): GameUI {
    if (!GameUI.instance) {
      throw new Error('GameUI must be initialized with an engine first')
    }
    return GameUI.instance
  }

  public initialize(): void {
    if (this.uiCreated) return

    // Create all UI elements
    this.createHealthBar()
    this.createAmmoUI()
    this.createTokenUI()
    this.createShopUI()
    this.createHireUI()
    this.createWaveButton(1)
    this.createZombieTracker()

    // Hide all UI initially
    this.hideAllUI()

    this.uiCreated = true
  }

  private hideAllUI(): void {
    if (this.healthBar) this.healthBar.style.display = 'none'
    if (this.ammoCounter) this.ammoCounter.style.display = 'none'
    if (this.tokenCounter) this.tokenCounter.style.display = 'none'
    this.hideWaveUI()
    this.hideShop()
    this.hideHireMenu()
  }

  public showGameUI(): void {
    if (this.healthBar) this.healthBar.style.display = 'block'
    if (this.ammoCounter) this.ammoCounter.style.display = 'block'
    if (this.tokenCounter) this.tokenCounter.style.display = 'block'
  }

  public showZombieTracker(): void {
    if (this.zombieTracker) {
      this.zombieTracker.classList.remove('hidden')
    }
  }

  public hideZombieTracker(): void {
    if (this.zombieTracker) {
      this.zombieTracker.classList.add('hidden')
    }
  }

  private createHealthBar(): HTMLDivElement {
    if (this.healthBar) return this.healthBar
    this.healthBar = document.createElement('div')
    this.healthBar.className = 'health-bar'
    this.healthBar.innerHTML = '<div class="fill"></div>'
    this.uiManager.addElement(this.healthBar)
    return this.healthBar
  }

  private createAmmoUI(): { counter: HTMLDivElement; prompt: HTMLDivElement } {
    if (this.ammoCounter && this.reloadPrompt) {
      return { counter: this.ammoCounter, prompt: this.reloadPrompt }
    }
    this.ammoCounter = document.createElement('div')
    this.ammoCounter.className = 'ammo-counter'

    const bulletIcon = document.createElement('img')
    bulletIcon.src = 'textures/BulletIcon.svg'
    bulletIcon.width = 24
    bulletIcon.height = 24

    const ammoText = document.createElement('span')
    ammoText.textContent = '0/0'

    this.ammoCounter.appendChild(bulletIcon)
    this.ammoCounter.appendChild(ammoText)

    this.reloadPrompt = document.createElement('div')
    this.reloadPrompt.className = 'reload-prompt'

    this.uiManager.addElement(this.ammoCounter)
    this.uiManager.addElement(this.reloadPrompt)

    return { counter: this.ammoCounter, prompt: this.reloadPrompt }
  }

  private createTokenUI(): HTMLDivElement {
    if (this.tokenCounter) return this.tokenCounter
    this.tokenCounter = document.createElement('div')
    this.tokenCounter.className = 'token-counter'

    const tokenIcon = document.createElement('img')
    tokenIcon.src = 'textures/TokenIcon.svg'
    tokenIcon.width = 24
    tokenIcon.height = 24

    const tokenText = document.createElement('span')
    tokenText.textContent = '0'

    this.tokenCounter.appendChild(tokenIcon)
    this.tokenCounter.appendChild(tokenText)
    this.uiManager.addElement(this.tokenCounter)

    return this.tokenCounter
  }

  private createShopUI(): void {
    if (this.shopMenu) return
    this.shopMenu = document.createElement('div')
    this.shopMenu.className = 'shop-menu hidden'

    const title = document.createElement('h2')
    title.textContent = 'Shop'

    const content = document.createElement('div')
    content.className = 'shop-content'

    this.shopMenu.appendChild(title)
    this.shopMenu.appendChild(content)

    const items = ShopSystem.getInstance().getItems()
    items.forEach((item) => {
      const itemElement = this.createShopItem(item)
      content.appendChild(itemElement)
    })

    this.uiManager.addElement(this.shopMenu)
  }

  private createShopItem(item: ShopItem): HTMLDivElement {
    const itemEl = document.createElement('div')
    itemEl.className = 'shop-item'
    if (ShopSystem.getInstance().isPurchased(item.id) && item.oneTime) {
      itemEl.classList.add('purchased')
    }

    const icon = document.createElement('img')
    icon.src = item.icon
    icon.width = 32
    icon.height = 32

    const info = document.createElement('div')
    info.className = 'item-info'
    info.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <span class="cost">${item.cost} tokens</span>
    `

    const buyBtn = document.createElement('button')
    buyBtn.textContent = 'Buy'
    buyBtn.onclick = () => this.handlePurchase(item, buyBtn)

    itemEl.appendChild(icon)
    itemEl.appendChild(info)
    itemEl.appendChild(buyBtn)

    return itemEl
  }

  private handlePurchase(item: ShopItem, button: HTMLButtonElement): void {
    const player = findPlayer(this.engine.currentScene)
    if (!player) return

    if (player.getTokens() < item.cost) {
      button.classList.add('shake')
      setTimeout(() => button.classList.remove('shake'), 500)
      return
    }

    if (ShopSystem.getInstance().purchaseItem(item.id, player)) {
      if (item.oneTime) {
        const itemEl = button.closest('.shop-item')
        if (itemEl) {
          itemEl.classList.add('purchased')
        }
      }

      // Update all buttons' affordability state
      this.updateShopButtonStates(player)
    }
  }

  private updateShopButtonStates(player: Player): void {
    const shopItems = this.shopMenu?.querySelectorAll('.shop-item')
    if (!shopItems) return

    shopItems.forEach((itemEl) => {
      const button = itemEl.querySelector('button')
      const costEl = itemEl.querySelector('.cost')
      if (!button || !costEl) return

      const cost = parseInt(costEl.textContent?.split(' ')[0] || '0')
      if (player.getTokens() < cost) {
        button.classList.add('cant-afford')
      } else {
        button.classList.remove('cant-afford')
      }
    })
  }

  public showShop(): void {
    this.shopMenu?.classList.remove('hidden')
    const player = findPlayer(this.engine.currentScene)
    if (player) {
      this.updateShopButtonStates(player)
    }
  }

  public hideShop(): void {
    this.shopMenu?.classList.add('hidden')
  }

  private createHireUI(): void {
    if (this.hireMenu) return
    this.hireMenu = document.createElement('div')
    this.hireMenu.className = 'hire-menu hidden'

    const title = document.createElement('h2')
    title.textContent = 'Hire Helpers'

    const content = document.createElement('div')
    content.className = 'hire-content'

    this.hireMenu.appendChild(title)
    this.hireMenu.appendChild(content)

    const items = ShopSystem.getInstance().getHireItems()
    items.forEach((item) => {
      const itemElement = this.createHireItem(item)
      content.appendChild(itemElement)
    })

    this.uiManager.addElement(this.hireMenu)
  }

  private createHireItem(item: HireItem): HTMLDivElement {
    const itemEl = document.createElement('div')
    itemEl.className = 'shop-item' // Reuse shop-item style

    if (!ShopSystem.getInstance().isHired(item.id)) {
      itemEl.classList.add('locked')
    }

    const icon = document.createElement('img')
    icon.src = item.icon
    icon.width = 32
    icon.height = 32

    const info = document.createElement('div')
    info.className = 'item-info'
    info.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <span class="cost">${
        ShopSystem.getInstance().isHired(item.id)
          ? `${item.hirePrice} tokens per wave`
          : `${item.cost} tokens to unlock`
      }</span>
    `

    const hireBtn = document.createElement('button')
    hireBtn.textContent = ShopSystem.getInstance().isHired(item.id)
      ? 'Hire'
      : 'Unlock'
    hireBtn.onclick = () => this.handleHire(item, hireBtn)

    itemEl.appendChild(icon)
    itemEl.appendChild(info)
    itemEl.appendChild(hireBtn)

    return itemEl
  }

  private handleHire(item: HireItem, button: HTMLButtonElement): void {
    const player = findPlayer(this.engine.currentScene)
    if (!player) return

    if (!ShopSystem.getInstance().isHired(item.id)) {
      // Handle unlock purchase
      if (ShopSystem.getInstance().purchaseItem(item.id, player)) {
        button.textContent = 'Hire'
        const itemEl = button.closest('.shop-item')
        if (itemEl) {
          itemEl.classList.remove('locked')
        }
      }
    } else {
      // Handle hiring
      if (ShopSystem.getInstance().hireHelper(item.id, player)) {
        button.classList.add('hired')
      }
    }
  }

  public showHireMenu(): void {
    this.hireMenu?.classList.remove('hidden')
  }

  public hideHireMenu(): void {
    this.hireMenu?.classList.add('hidden')
  }

  public createWaveButton(waveNumber: number): void {
    if (this.waveButton) return
    this.waveButton = document.createElement('div')
    this.waveButton.className = 'button wave'
    this.waveButton.textContent = `Start Wave ${waveNumber}`
    this.uiManager.addElement(this.waveButton)
  }

  public createZombieTracker(): void {
    if (this.zombieTracker) return
    this.zombieTracker = document.createElement('div')
    this.zombieTracker.className = 'zombie-tracker hidden'

    const zombieIcon = document.createElement('img')
    zombieIcon.src = 'textures/ZombieIcon.svg'
    zombieIcon.width = 24
    zombieIcon.height = 24

    const counter = document.createElement('span')
    counter.textContent = '0'

    this.zombieTracker.appendChild(zombieIcon)
    this.zombieTracker.appendChild(counter)

    this.uiManager.addElement(this.zombieTracker)
  }

  public setupWaveUI(waveNumber: number, onClick: () => void): void {
    if (!this.waveButton || !this.zombieTracker) return

    // Update wave button
    this.waveButton.textContent = `Start Wave ${waveNumber}`
    this.waveButton.onclick = onClick
    this.waveButton.style.display = 'block'

    // Ensure zombie tracker is hidden initially
    this.zombieTracker.classList.add('hidden')
  }

  public updateAmmoUI(
    current: number,
    total: number,
    isReloading: boolean
  ): void {
    if (this.ammoCounter) {
      const ammoText = this.ammoCounter.querySelector('span')
      if (ammoText) {
        ammoText.textContent = `${current}/${total}`
      }
    }
    if (this.reloadPrompt) {
      this.reloadPrompt.classList.toggle(
        'visible',
        current === 0 || isReloading
      )
      this.reloadPrompt.textContent =
        total === 0
          ? 'Find More Ammo!'
          : isReloading
            ? 'Reloading...'
            : 'Press R to Reload'
      this.reloadPrompt.style.color = isReloading
        ? 'white'
        : total === 0
          ? 'red'
          : 'yellow'
    }
  }

  public updateHealthBar(current: number, max: number): void {
    if (this.healthBar) {
      const fill = this.healthBar.querySelector('.fill') as HTMLDivElement
      if (fill) {
        fill.style.width = `${(current / max) * 100}%`
      }
    }
  }

  public updateTokenCount(count: number): void {
    if (this.tokenCounter) {
      const tokenText = this.tokenCounter.querySelector('span')
      if (tokenText) {
        tokenText.textContent = count.toString()
      }
    }
  }

  public hideWaveUI(): void {
    if (this.waveButton) {
      this.waveButton.style.display = 'none'
    }
    this.hideZombieTracker()
    if (this.reloadPrompt) {
      this.reloadPrompt.classList.remove('visible')
    }
  }

  public showWaveUI(): void {
    if (this.waveButton) {
      this.waveButton.style.display = 'block'
    }
  }

  public updateWaveButton(waveNumber: number): void {
    if (this.waveButton) {
      this.waveButton.textContent = `Start Wave ${waveNumber}`
    }
  }

  public updateZombieCount(count: number): void {
    if (this.zombieTracker) {
      const counter = this.zombieTracker.querySelector('span')
      if (counter) {
        counter.textContent = count.toString()
      }
    }
  }
}
