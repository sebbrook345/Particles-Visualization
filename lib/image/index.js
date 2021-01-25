import Jimp from 'jimp'
import Grid from '../grid/Grid.js'
import chroma from 'chroma-js'

const f = chroma.scale(['black', 'white'])

console.log(chroma(f(0.1)).rgb())

class Image {
    constructor({
        resolution
    }) {
        this.resolution = resolution
        this.grid = new Grid()
    }

    update = (pos) => {
        const x = Math.floor(this.resolution * pos[0])
        const y = Math.floor(this.resolution * pos[1])
        
        const v = this.grid.get(x, y) || 0
        this.grid.set(x, y, v + 1)
    }

    save = () => {
        new Jimp(this.grid.width, this.grid.height, (err, image) => {
            let max = Number.MIN_VALUE
            let min = Number.MAX_VALUE

            this.grid.iterate((x, y, v) => {
                if (v > max) {
                    max = v
                }
                if (v < min) {
                    min = v
                }
            })

            for (let i = 0; i < this.grid.width; i++) {
                for (let j = 0; j < this.grid.height; j++) {
                    image.setPixelColor(0x000000ff, i, j)
                }
            }

            this.grid.iterate((x, y, v) => {
                // const c = chroma(f(v / max)).rgb()
                // console.log(c)
                image.setPixelColor(Jimp.rgbaToInt(...chroma(f(v / max)).rgb(), 255), x, y)
            })
            image.write('test.png')
        })
    }
}

export default Image