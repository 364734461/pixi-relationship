import { Application, settings, PRECISION } from "pixi.js"
import { Viewport } from "pixi-viewport"
import debounce from "lodash/debounce"

import BackgroundContainer from "./mod/background"
import MainContainer from "./mod/main"

const defaultProps = {
  containerID: "pixi-relationship",
  backgroundRoundColor: 0xceefff,
  applicationOptions: {
    backgroundColor: 0xceefff
  },
  linksColors: [0x71b7ff, 0x509838, 0xfd8888, 0xfff36a],
  linksTypeLabel: ["爱情", "亲情", "友情"]
}

/**
 * props:
 *          --key--                         --default--                                     --value--
 *          containerID                   pixi-relationship                                 string
 *          applicationOptions            null                                              object<PIXI.Application - options>
 *          backgroundRoundColor          0xceefff                                          0x...  number
 *          nameStyle                                                                       (options) => PIXI.TextStyle
 *          borderColor                                                                     0x...  number
 *          borderColorHover                                                                0x...  number
 *          linksColors                   [0x71b7ff, 0x509838, 0xfd8888, 0xfff36a]          Array<...> | Object
 *          linksTypeLabel                ['爱情', '亲情', '友情']                           Array<...> | Object
 *          placeholderImg
 *          onClick
 *          data
 *
 */
class CanvasApp extends Application {
  constructor(props = {}) {
    Object.keys(props).forEach(key => {
      if (typeof props[key] === "undefined") {
        delete props[key]
      }
    })

    const options = Object.assign({}, defaultProps, props)
    const domElement = document.getElementById(options.containerID)

    super(
      Object.assign({}, defaultProps.applicationOptions, options.applicationOptions, {
        autoStart: false,
        resizeTo: domElement,
        antialias: true
      })
    )

    this.options = options

    settings.PRECISION_FRAGMENT = PRECISION.HIGH

    domElement.appendChild(this.view)

    this.domElement = domElement
  }

  /**
   * Convenience for getting resources
   * @member {object}
   */
  get resources() {
    return this.loader.resources
  }

  /**
   * Load resources
   * @param {object} manifest Collection of resources to load
   */
  load(manifest, callback) {
    this.loader.add(manifest).load(() => {
      callback && callback()
      this.init()
    })
  }

  init() {
    this.initBackground()
    this.initMain()

    this.addEvent()

    this.start()
  }

  initBackground() {
    const { stage, screen } = this
    const radius = 50
    const bgContainer = new BackgroundContainer({
      radius,
      backgroundRoundColor: this.options.backgroundRoundColor,
      width: screen.width,
      height: screen.height,
      num: (screen.width * screen.height) / Math.pow(radius, 2) / 30
    })
    stage.addChild(bgContainer)
  }

  initMain() {
    const { stage, screen, options, renderer } = this

    const viewport = new Viewport({
      screenWidth: screen.width,
      screenHeight: screen.height,
      worldWidth: screen.width,
      worldHeight: screen.height,
      interaction: renderer.plugins.interaction
    })
    stage.addChild(viewport)
    this.viewport = viewport
    viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()

    const mainContainer = new MainContainer({
      width: screen.width,
      height: screen.height,
      placeholderImg: options.placeholderImg,
      backgroundRoundColor: options.backgroundRoundColor,
      nameStyle: options.nameStyle,
      onClick: options.onClick,
      data: options.data,
      linksColors: options.linksColors,
      borderColor: options.borderColor,
      borderColorHover: options.borderColorHover
    })
    viewport.addChild(mainContainer)
  }

  addEvent() {
    this.ticker.add(this.animate, this)

    this.debounceResize = debounce(this.resizeViewport, 150)
    window.addEventListener("resize", this.debounceResize)
  }

  removeEvent() {
    this.ticker.remove(this.animate)

    window.removeEventListener("resize", this.debounceResize)
  }

  resizeViewport = () => {
    this.viewport && this.viewport.resize()
  }

  animate(delta) {
    const { stage } = this
    Array.isArray(stage.children) &&
      stage.children.forEach(item => {
        typeof item.animate === "function" && item.animate(delta)
      })
  }
}

export default CanvasApp
