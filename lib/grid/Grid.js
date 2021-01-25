export default class Grid {
    constructor() {
        this.grid = new Map()
        this.width = 0
        this.height = 0
    }

    static fromNestedMap = (map) => {
        const ret = new Grid()
        map.forEach((nestedMap, x) => {
            nestedMap.forEach((v, y) => {
                ret.set(x, y, v)
            })
        })

        return ret
    }

    has = (x, y) => this.grid.get(x) && this.grid.get(x).has(y)

    get = (x, y) => this.grid.get(x) && this.grid.get(x).get(y)

    set = (x, y, v) => {
        if (x > this.width) {
            this.width = x
        }
        if (y > this.height) {
            this.height = y
        }
        return this.grid.get(x) ? this.grid.get(x).set(y, v) : this.grid.set(x, new Map([[y, v]]))
    }

    iterate = (fn) => {
        this.grid.forEach((ys, x) => {
            ys.forEach((v, y) => {
                fn(x, y, v)
            })
        })
    }

    merge = (otherGrid, mergeFn) => {
        otherGrid.iterate((x, y, v) => {
            this.set(x, y, mergeFn(this.get(x, y), v, x, y))
        })
    }

    map = (fn) => {
        const grid = new Grid()
        this.iterate((x, y, v) => {
            grid.set(x, y, fn(x, y, v))
        })
        return grid
    }

    reduce = (fn, target) => {
        this.iterate((x, y, v) => {
            target = fn(target, v, x, y)
        })
        return target
    }

    toJSON = () => {
        const json = {}
        this.iterate((x, y, v) => {
            if (!json[x]) {
                json[x] = {}
            }
            if (!json[x][y]) {
                json[x][y] = {}
            }

            json[x][y] = v
        })
        return json
    }
}