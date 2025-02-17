import * as ex from 'excalibur'
import { NineSlices } from '../resources'

export interface DialogBubbleConfig {
  align?: 'left' | 'right'
}

export class DialogBubble extends ex.Actor {
  private text: ex.Label
  private background: ex.Actor
  private alignment: 'left' | 'right'

  constructor(config: DialogBubbleConfig = {}) {
    super({
      width: 100,
      height: 100,
      z: 100,
      opacity: 0,
    })

    this.alignment = config.align || 'left'

    this.background = new ex.Actor({
      width: 100,
      height: 100,
      color: ex.Color.White,
      z: -1,
      anchor: ex.vec(this.alignment === 'left' ? 0 : 1, 0.5),
    })

    this.background.graphics.use(NineSlices.ChatBubble(100, 100))

    this.text = new ex.Label({
      text: '',
      pos: ex.vec(this.alignment === 'left' ? 25 : -25, -7),
      anchor: ex.vec(this.alignment === 'left' ? 0 : 1, 0),
      color: ex.Color.Black,
      font: new ex.Font({
        smoothing: true,
        family: 'sans-serif',
        size: 16,
        bold: true,
        textAlign:
          this.alignment === 'left' ? ex.TextAlign.Left : ex.TextAlign.Right,
      }),
    })

    this.addChild(this.background)
    // this.graphics.use(this.text)
    this.addChild(this.text)
  }

  public showMessage(message: string, duration: number = 3000): void {
    this.text.text = message
    this.actions.fade(1, 100)

    const desiredWidth = this.text.getTextWidth() + 25
    const desiredHeight = this.text.height + 20

    this.background.graphics.use(
      NineSlices.ChatBubble(desiredWidth + 20, desiredHeight + 35)
    )

    // Flip the background if right-aligned
    if (this.alignment === 'right') {
      this.background.scale = ex.vec(-1, 1)
    }

    setTimeout(() => {
      this.actions.clearActions()
      this.actions
        .delay(duration)
        .fade(0, 300)
        .callMethod(() => {
          this.text.text = ''
        })
    }, 200)
  }
}
