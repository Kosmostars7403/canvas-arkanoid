const KEYS = {
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32
}

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 360

let game = {
  ctx: null,
  platform: null,
  ball: null,
  blocks: [],
  rows: 4,
  cols: 8,
  score: 0,
  over: false,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null
  },
  init: function () {
    const canvas = document.getElementById("canvas")
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    this.ctx = canvas.getContext("2d");
    this.setEventsListeners()
  },
  setEventsListeners() {
    window.addEventListener('keydown', e => {
      if (e.keyCode === KEYS.SPACE) {
        this.platform.fire()
      } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode)
      }
    })

    window.addEventListener('keyup', e => {
      this.platform.stop()
    })
  },
  preload(callback) {
    const assetsNames = Object.keys(this.sprites)
    let loaded = 0

    const onImageLoad = () => {
      loaded += 1
      if (loaded > assetsNames.length - 1) {
        callback()
      }
    }

    assetsNames.forEach((key, index) => {
      this.sprites[key] = new Image();
      this.sprites[key].src = `img/${key}.png`
      this.sprites[key].addEventListener('load', onImageLoad)
    })
  },
  create() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          x: (col + 1) * 64,
          y: (row + 1) * 24,
          height: 20,
          width: 60,
          destroyed: false
        })
      }
    }
  },
  update() {
    this.collideBlocks()
    this.collidePlatform()
    this.ball.collideScreenFrame()
    this.platform.collideScreenFrame()
    this.platform.move()
    this.ball.move()
  },
  addScore() {
    ++this.score

    if (this.score === this.blocks.length) {
      this.end('VICTORY!')
    }
  },
  collideBlocks() {
    for (let block of this.blocks) {
      if (!block.destroyed && this.ball.collide(block)) {
        this.ball.bumpBlock(block)
        this.addScore()
      }
    }
  },
  collidePlatform() {
    if (this.ball.collide(this.platform)) this.ball.bumpPlatform(this.platform)
  },
  end(message) {
    this.over = true
    window.alert(message)
    window.location.reload()
  },
  run() {
    if (!this.over) {
      window.requestAnimationFrame(() => {
        this.update()
        this.render()
        this.run()
      });
    }
  },
  render() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.size, this.ball.size, this.ball.x, this.ball.y, this.ball.size, this.ball.size);

    for (let block of this.blocks) {
      if (block.destroyed) continue
      this.ctx.drawImage(this.sprites.block, block.x, block.y);
    }
  },
  start: function () {
    this.init()
    this.preload(() => {
      this.create()
      this.run()
    })
  },
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
};

game.ball = {
  x: 320,
  y: 280,
  size: 20,
  dx: 0,
  dy: 0,
  velocity: 3,
  start() {
    this.dy = -this.velocity
    this.dx = game.random(-this.velocity, this.velocity)
  },
  move() {
    if (this.dy) {
      this.y += this.dy
    }

    if (this.dx) {
      this.x += this.dx
    }
  },
  collide(element) {
    const x = this.x + this.dx
    const y = this.y + this.dy
    return x + this.size > element.x &&
        x < element.x + element.width &&
        y + this.size > element.y &&
        y < element.y + element.height
  },
  collideScreenFrame() {
    const screenLeft = 0
    const screenTop = 0

    const ballRight = this.x + this.size
    const ballBottom = this.y + this.size

    if (this.x < screenLeft || ballRight > CANVAS_WIDTH) {
      this.dx *= -1
    } else if (this.y < screenTop) {
      this.dy = this.velocity
    } else if(ballBottom > CANVAS_HEIGHT) {
      this.dx = 0
      this.dy = 0
      game.end('GAME OVER!')
    }
  },
  bumpBlock(block) {
    this.dy *= -1
    block.destroyed = true
  },
  bumpPlatform(platform) {
    if (platform.dx) {
      this.x += platform.dx
    }

    if (this.dy > 0)  {
      this.dy = -this.velocity
      const touchX = this.x + this.size / 2
      this.dx = this.velocity * platform.getTouchOffset(touchX)
    }
  }
}

game.platform = {
  x: 280,
  y: 300,
  dx: 0,
  height: 14,
  width: 100,
  velocity: 6,
  ball: game.ball,
  move() {
    if (this.dx) {
      this.x += this.dx
      if (this.ball) this.ball.x += this.dx
    }
  },
  start(direction) {
    if (direction === KEYS.LEFT) {
      this.dx = -this.velocity
    } else if (direction === KEYS.RIGHT) {
      this.dx = this.velocity
    }
  },
  stop() {
    this.dx = 0
  },
  fire() {
    if (this.ball) {
      this.ball.start()
      this.ball = null
    }
  },
  getTouchOffset(touchX) {
    let diff = (this.x + this.width) - touchX
    let offset = this.width - diff
    let result = 2 * offset / this.width
    return result - 1
  },
  collideScreenFrame() {
    const x = this.x + this.dx
    const screenLeft = 0

    const platformRight = x + this.width

    if (x < screenLeft || platformRight > CANVAS_WIDTH) {
      this.dx = 0
    }
  }
}

window.addEventListener("load", () => {
  game.start();
});
