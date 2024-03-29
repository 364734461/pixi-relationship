import { Graphics, Sprite, Texture, Text, TextStyle } from "pixi.js"

import Observers from "./observers"
import zIndexConfig from "../utils/zIndex"

const defaultProps = {
  color: 0xffffff,
  nameStyle: undefined,
  borderColor: 0x000000,
  borderColorHover: 0x598dff
}

class CardSprite extends Sprite {
  constructor(options) {
    super()

    Object.keys(options).forEach(key => {
      if (typeof options[key] === "undefined") {
        delete options[key]
      }
    })

    this.options = Object.assign({}, defaultProps, options)

    this.id = this.options.id

    this.zIndex = zIndexConfig.card[0]

    this.addEvent()

    this.init()
  }

  addEvent() {
    Observers.on("change-card-key", this.onTriggerClearHover)
    Observers.on("change-card-zIndex", this.onTriggerZIndex)
  }

  removeEvent() {
    Observers.off("change-card-key", this.onTriggerClearHover)
    Observers.off("change-card-zIndex", this.onTriggerZIndex)
  }

  init() {
    this.visible = false

    const data = this.options.data

    this.position.set(data.coor[0], data.coor[1])
    this.anchor.set(0.5, 0.5)
    this.interactive = true
    this.buttonMode = true
    this.on("pointerdown", this.onButtonDown)
      .on("pointerup", this.onButtonUp)
      .on("pointerupoutside", this.onButtonUp)
      .on("pointerover", this.onButtonOver)
      .on("pointerout", this.onButtonOut)

    const lightbulb = new Graphics()
    this.lightbulb = lightbulb
    this.addChild(lightbulb)
    lightbulb.beginFill(0xffffff)
    lightbulb.lineStyle(5, 0x000000, 0.3)
    lightbulb.drawCircle(0, 0, data.r + 4)

    let texture
    let focus
    if (data.img) {
      texture = Texture.from(data.img)
    } else if (this.options.placeholderTexture) {
      texture = this.options.placeholderTexture
    }
    if (texture) {
      const imgSprite = new Sprite(texture)
      this.addChild(imgSprite)
      imgSprite.width = data.r * 2
      imgSprite.height = data.r * 2
      imgSprite.position.set(0, 0)
      imgSprite.anchor.set(0.5, 0.5)

      if (this.options.onClick) {
        focus = new Graphics()
          .beginFill(0x000000, 0.7)
          .drawCircle(0, 0, data.r)
          .endFill()
        this.addChild(focus)
        const nameTextHover = new Text(
          "查看详情",
          new TextStyle({
            fontFamily:
              "-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol",
            fontSize: data.r / 3,
            fontWeight: 500,
            fill: ["#fff"],
            align: "center"
          })
        )
        nameTextHover.anchor.set(0.5, 0.5)
        nameTextHover.position.set(0, 0)
        focus.addChild(nameTextHover)
        focus.visible = false
        this.onClick = () => {
          this.options.onClick(data)
        }
      }

      const mask = new Graphics()
        .beginFill()
        .drawCircle(0, 0, data.r)
        .endFill()
      this.addChild(mask)
      imgSprite.mask = mask

      const nameStyle = new TextStyle(
        typeof this.options.nameStyle == "function"
          ? this.options.nameStyle(this.options)
          : {
              fontFamily:
                "-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol",
              fontSize: data.r / 2,
              fontWeight: "bold",
              fill: [this.options.color, "#666"], // gradient
              strokeThickness: 2,
              dropShadow: true,
              dropShadowColor: "#000000",
              dropShadowBlur: 4,
              dropShadowAngle: Math.PI / 6,
              dropShadowDistance: 6,
              wordWrap: true,
              wordWrapWidth: 440,
              align: "center"
            }
      )
      const nameText = new Text(data.name || "未知姓名", nameStyle)
      this.addChild(nameText)
      nameText.anchor.set(0.5, 0.5)
      nameText.position.set(0, imgSprite.height / 2)
    }

    this.onOver = () => {
      focus && (focus.visible = true)

      Observers.trigger("change-card-key", this.id)
    }

    this.onOut = () => {
      focus && (focus.visible = false)
    }
  }

  onButtonDown() {
    this.isdown = true
    this.alpha = 0.7
  }

  onButtonUp() {
    this.isdown = false
    this.alpha = 1
    if (this.isOver) {
      this.onClick && this.onClick()
    }
  }

  onButtonOver() {
    this.isOver = true
    this.onOver && this.onOver()
  }

  onButtonOut() {
    this.isOver = false
    this.onOut && this.onOut()
  }

  onTriggerClearHover = id => {
    if (id !== this.id) {
      this.lightbulb.clear()
      this.lightbulb.lineStyle(5, this.options.borderColor, 0.3)
      this.lightbulb.drawCircle(0, 0, this.options.data.r + 4)
    } else {
      this.lightbulb.clear()
      this.lightbulb.lineStyle(8, this.options.borderColorHover, 1)
      this.lightbulb.drawCircle(0, 0, this.options.data.r + 10)
    }
  }

  onTriggerZIndex = zIndex => {
    this.zIndex = zIndex
  }
}

export default CardSprite
