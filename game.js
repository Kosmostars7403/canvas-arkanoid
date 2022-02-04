const KEYS = {
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32
}

let game = {
  ctx: null,
  platform: null,
  ball: null,
  blocks: [],
  rows: 4,
  cols: 8,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null
  },
  init: function () {
    this.ctx = document.getElementById("canvas").getContext("2d");
    this.setEventsListeners()
  },
  setEventsListeners() {
    window.addEventListener('keydown', e => {
      if (e.keyCode === KEYS.SPACE) {
        this.ball.start()
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
          y: (row + 1) * 24
        })
      }
    }
  },
  update() {
    this.platform.move()
    this.ball.move()
  },
  run() {
    window.requestAnimationFrame(() => {
      this.update()
      this.render()
      this.run()
    });
  },
  render() {
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.size, this.ball.size, this.ball.x, this.ball.y, this.ball.size, this.ball.size);

    for (let block of this.blocks) {
      this.ctx.drawImage(this.sprites.block, block.x, block.y);
    }
  },
  start: function () {
    this.init()
    this.preload(() => {
      this.create()
      this.run()
    })
  }
};

game.platform = {
  x: 280,
  y: 300,
  dx: 0,
  velocity: 6,
  move() {
    if (this.dx) {
      this.x += this.dx
      game.ball.x += this.dx
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
  }
}

game.ball = {
  x: 320,
  y: 280,
  size: 20,
  dx: 0,
  dy: 0,
  velocity: -3,
  start() {
    this.dy = this.velocity
  },
  move() {
    if (this.dy) {
      this.y += this.dy
    }
  }
}

window.addEventListener("load", () => {
  game.start();
});
