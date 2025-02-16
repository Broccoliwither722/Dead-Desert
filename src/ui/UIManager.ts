export class UIManager {
  private static instance: UIManager
  private uiContainer: HTMLElement

  private constructor() {
    this.uiContainer = document.getElementById('ui') as HTMLElement
  }

  static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager()
    }
    return UIManager.instance
  }

  setScene(sceneName: string) {
    this.uiContainer.className = sceneName
  }

  addElement(element: HTMLElement) {
    this.uiContainer.appendChild(element)
  }

  clearUI() {
    this.uiContainer.className = ''
    this.uiContainer.innerHTML = ''
  }
}
