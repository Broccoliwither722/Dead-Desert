import * as ex from 'excalibur'
import { Bullet } from './bullet'
import { Resources } from '../resources'
import { GameUI } from '../ui/gameUI'
import { ShopSystem } from '../systems/shopSystem'

interface PlayerOptions {
  pos?: ex.Vector
  numberOfGuns?: number
}

export class Player extends ex.Actor {
  jumping = false
  private speed = 150 // pixels per second
  public health: number = 10
  private maxHealth: number = 10
  private hasGun: boolean = false
  private lastShotTime: number = 0
  private shotCooldown: number = 500 // ms between shots
  private engine: ex.Engine
  private initialPosition: ex.Vector
  private tokens: number = 0

  private idleSprite = Resources.playerIdle.toSprite()
  private oneGunSprite = Resources.playerOneGun.toSprite()

  private totalAmmo: number = 30
  private currentAmmo: number = 6
  private maxAmmo: number = 6
  private isReloading: boolean = false
  private gameUI: GameUI

  public hasGuns(numberOfGuns: number) {
    this.hasGun = numberOfGuns > 0
    this.graphics.use(this.hasGun ? this.oneGunSprite : this.idleSprite)
  }

  constructor(options: PlayerOptions = {}) {
    super({
      pos: options.pos || ex.vec(100, 100),
      width: 32,
      height: 32,
      z: 2,
      anchor: ex.vec(0.6, 0.5), // Add this line - 0.5,0.5 is center (values from 0 to 1)
      collisionType: ex.CollisionType.Active,
      collider: new ex.CircleCollider({
        radius: 16,
        offset: ex.vec(0, 0),
      }),
    })

    this.initialPosition = options.pos || ex.vec(100, 100)
    this.gameUI = GameUI.getInstance()

    if (options.numberOfGuns !== undefined) {
      this.hasGun = options.numberOfGuns > 0
      if (this.hasGun) {
        // Update anchor point to be the center left of the sprite
        this.anchor = ex.vec(0.3, 0.4)
      }
    }

    // Load saved states
    this.loadAmmoState()
    this.loadTokens()
    this.loadHealthState()
  }

  private updateAmmoUI() {
    this.gameUI.updateAmmoUI(this.currentAmmo, this.totalAmmo, this.isReloading)
  }

  public addAmmo(amount: number) {
    this.totalAmmo += amount
    this.updateAmmoUI()
    this.saveAmmoState()
  }

  public saveAmmoState(): void {
    localStorage.setItem(
      'playerAmmo',
      JSON.stringify({
        total: this.totalAmmo,
        current: this.currentAmmo,
      })
    )
  }

  public loadAmmoState(): void {
    const savedAmmo = localStorage.getItem('playerAmmo')
    if (savedAmmo) {
      const { total, current } = JSON.parse(savedAmmo)
      this.totalAmmo = total
      this.currentAmmo = current
      this.updateAmmoUI()
    }
  }

  private saveHealthState(): void {
    localStorage.setItem('playerHealth', this.health.toString())
  }

  public loadHealthState(): void {
    const savedHealth = localStorage.getItem('playerHealth')
    if (savedHealth) {
      this.health = parseInt(savedHealth)
      this.setHealthBar()
    }
  }

  override onInitialize(engine: ex.Engine): void {
    this.engine = engine
    // Update sprite based on initial gun state
    this.graphics.use(this.hasGun ? this.oneGunSprite : this.idleSprite)
  }

  override onPreUpdate(_engine: ex.Engine, _delta: number): void {
    // Handle horizontal movement (A/D)
    if (
      _engine.input.keyboard.isHeld(ex.Keys.A) ||
      _engine.input.keyboard.isHeld(ex.Keys.Left)
    ) {
      this.vel.x = -this.speed
    } else if (
      _engine.input.keyboard.isHeld(ex.Keys.D) ||
      _engine.input.keyboard.isHeld(ex.Keys.Right)
    ) {
      this.vel.x = this.speed
    } else {
      this.vel.x = 0
    }

    // Handle vertical movement (W/S)
    if (
      _engine.input.keyboard.isHeld(ex.Keys.W) ||
      _engine.input.keyboard.isHeld(ex.Keys.Up)
    ) {
      this.vel.y = -this.speed
    } else if (
      _engine.input.keyboard.isHeld(ex.Keys.S) ||
      _engine.input.keyboard.isHeld(ex.Keys.Down)
    ) {
      this.vel.y = this.speed
    } else {
      this.vel.y = 0
    }

    // Get mouse position in world coordinates
    const mousePos = _engine.input.pointers.primary.lastWorldPos

    // Calculate direction vector from bird to mouse
    const direction = mousePos.sub(this.pos)

    // Set rotation to face mouse
    this.rotation = direction.toAngle()

    // Handle reloading
    if (_engine.input.keyboard.wasPressed(ex.Keys.R) && !this.isReloading) {
      this.startReload()
    }

    // Shooting mechanics
    if (
      this.hasGun &&
      _engine.input.pointers.isDown(0) &&
      this.currentAmmo > 0 &&
      !this.isReloading
    ) {
      const currentTime = Date.now()
      if (currentTime - this.lastShotTime >= this.shotCooldown) {
        const direction = _engine.input.pointers.primary.lastWorldPos.sub(
          this.pos
        )
        // Calculate the gun's offset position relative to the player's rotation
        const gunOffset = ex.vec(30, -15).rotate(this.rotation)
        const bulletPos = this.pos.add(gunOffset)
        const bullet = new Bullet(bulletPos, direction)
        this.scene?.add(bullet)
        this.lastShotTime = currentTime
        this.currentAmmo--
        this.updateAmmoUI()
        this.saveAmmoState()
      }
    }
  }

  private startReload() {
    if (this.totalAmmo === 0 || this.currentAmmo === this.maxAmmo) return

    this.isReloading = true
    this.updateAmmoUI()

    // 1.5 second reload time
    setTimeout(() => {
      const bulletsNeeded = this.maxAmmo - this.currentAmmo
      const bulletsAvailable = Math.min(this.totalAmmo, bulletsNeeded)

      this.currentAmmo += bulletsAvailable
      this.totalAmmo -= bulletsAvailable
      this.isReloading = false
      this.updateAmmoUI()
      this.saveAmmoState()
    }, 1500)
  }

  private setHealthBar(): void {
    this.gameUI.updateHealthBar(this.health, this.maxHealth)
  }

  public damage(amount: number): void {
    this.health = Math.max(0, this.health - amount)
    this.gameUI.updateHealthBar(this.health, this.maxHealth)
    this.saveHealthState()

    if (this.health <= 0) {
      this.engine.goToScene('GameOver')
    }
  }

  public reset(): void {
    this.health = this.maxHealth
    this.gameUI.updateHealthBar(this.health, this.maxHealth)
    // Reset position to starting position
    this.pos = this.scene?.engine.screen.center ?? ex.vec(100, 100)
    this.totalAmmo = 30
    this.currentAmmo = 6
    this.isReloading = false
    this.updateAmmoUI()
    this.tokens = 0
    this.gameUI.updateTokenCount(this.tokens)

    // Clear all localStorage data
    localStorage.removeItem('playerAmmo')
    localStorage.removeItem('playerTokens')
    localStorage.removeItem('playerHealth')
  }

  public addTokens(amount: number): void {
    this.tokens += amount
    this.gameUI.updateTokenCount(this.tokens)
    this.saveTokens()
  }

  private saveTokens(): void {
    localStorage.setItem('playerTokens', this.tokens.toString())
  }

  public loadTokens(): void {
    const savedTokens = localStorage.getItem('playerTokens')
    if (savedTokens) {
      this.tokens = parseInt(savedTokens)
      this.gameUI.updateTokenCount(this.tokens)
    }
  }

  public getTokens(): number {
    return this.tokens
  }

  public spendTokens(amount: number): void {
    this.tokens = Math.max(0, this.tokens - amount)
    this.gameUI.updateTokenCount(this.tokens)
    this.saveTokens()
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount)
    this.gameUI.updateHealthBar(this.health, this.maxHealth)
    this.saveHealthState()
  }

  public increaseMaxHealth(amount: number): void {
    this.maxHealth += amount
    if (this.health > this.maxHealth) {
      this.health = Math.min(this.health + amount, this.maxHealth)
    }
    this.gameUI.updateHealthBar(this.health, this.maxHealth)
    this.saveHealthState()
  }

  public override onAdd(engine: ex.Engine): void {
    super.onAdd(engine)
    // Update UI with current state
    this.updateAmmoUI()
    this.gameUI.updateTokenCount(this.tokens)
    this.gameUI.updateHealthBar(this.health, this.maxHealth)
    // Apply any persistent perks
    ShopSystem.getInstance().applyPurchasedPerks(this)
  }
}
