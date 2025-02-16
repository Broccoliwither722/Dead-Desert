import * as ex from 'excalibur'

export class OnScreenControls {
  private static instance: OnScreenControls
  private analogStick: HTMLDivElement
  private analogKnob: HTMLDivElement
  private shootButton: HTMLButtonElement
  private reloadButton: HTMLButtonElement
  private container: HTMLDivElement

  private moveVector: ex.Vector = ex.vec(0, 0)
  private isShooting: boolean = false
  private isReloading: boolean = false

  private constructor() {
    this.createControlElements()
    this.setupEventListeners()
  }

  static getInstance(): OnScreenControls {
    if (!OnScreenControls.instance) {
      OnScreenControls.instance = new OnScreenControls()
    }
    return OnScreenControls.instance
  }

  private createControlElements() {
    this.container = document.createElement('div')
    this.container.className = 'mobile-controls'

    // Create analog stick
    this.analogStick = document.createElement('div')
    this.analogStick.className = 'analog-stick'
    this.analogKnob = document.createElement('div')
    this.analogKnob.className = 'analog-knob'
    this.analogStick.appendChild(this.analogKnob)

    // Create action buttons container
    const actionButtons = document.createElement('div')
    actionButtons.className = 'action-buttons'

    // Create shoot button
    this.shootButton = document.createElement('button')
    this.shootButton.className = 'shoot-button'
    this.shootButton.textContent = 'SHOOT'

    // Create reload button
    this.reloadButton = document.createElement('button')
    this.reloadButton.className = 'reload-button'
    this.reloadButton.textContent = 'RELOAD'

    // Assemble the controls
    actionButtons.appendChild(this.shootButton)
    actionButtons.appendChild(this.reloadButton)
    this.container.appendChild(this.analogStick)
    this.container.appendChild(actionButtons)
  }

  private setupEventListeners() {
    // Analog stick touch handling
    let startPos: ex.Vector | null = null

    this.analogStick.addEventListener('touchstart', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const touch = e.touches[0]
      const rect = this.analogStick.getBoundingClientRect()
      startPos = ex.vec(
        touch.clientX - rect.left - rect.width / 2,
        touch.clientY - rect.top - rect.height / 2
      )
      this.updateKnobPosition(startPos)
    })

    this.analogStick.addEventListener('touchmove', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (startPos) {
        const touch = e.touches[0]
        const rect = this.analogStick.getBoundingClientRect()
        const currentPos = ex.vec(
          touch.clientX - rect.left - rect.width / 2,
          touch.clientY - rect.top - rect.height / 2
        )
        this.updateKnobPosition(currentPos)
      }
    })

    this.analogStick.addEventListener('touchend', (e) => {
      e.preventDefault()
      e.stopPropagation()
      startPos = null
      this.moveVector = ex.vec(0, 0)
      this.analogKnob.style.transform = 'translate(-50%, -50%)'
    })

    // Shoot button handling
    this.shootButton.addEventListener('touchstart', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.isShooting = true
    })

    this.shootButton.addEventListener('touchend', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.isShooting = false
    })

    // Reload button handling
    this.reloadButton.addEventListener('touchstart', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.isReloading = true
    })

    this.reloadButton.addEventListener('touchend', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.isReloading = false
    })
  }

  private updateKnobPosition(pos: ex.Vector) {
    const maxDistance = 40
    const distance = pos.distance()
    const normalized = pos.normalize()
    const clampedDistance = Math.min(distance, maxDistance)
    const finalPos = normalized.scale(clampedDistance)

    this.moveVector = normalized.scale(clampedDistance / maxDistance)
    this.analogKnob.style.transform = `translate(calc(-50% + ${finalPos.x}px), calc(-50% + ${finalPos.y}px))`
  }

  public getMoveVector(): ex.Vector {
    return this.moveVector
  }

  public isTryingToShoot(): boolean {
    return this.isShooting
  }

  public isTryingToReload(): boolean {
    return this.isReloading
  }

  public show() {
    document.body.appendChild(this.container)
  }

  public hide() {
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }
  }
}
