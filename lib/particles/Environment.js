import Grid from '../grid/Grid.js'
import { copy } from '../math/vector.js'

export default class Environment {
    constructor({ shape, state, emitter, weight }) {
        // this.getState = state.getState
        this.state = state
        this.shape = shape
        this.updateIndex = 0
        this.previousEmissions = new Grid()
        this._initCoordinatesFromShape(shape)
        emitter && this.setEmitter(emitter)
        this.weight = weight
    }

    _initCoordinatesFromShape = (shape) => {
        this.coordinates = Grid.fromNestedMap(shape.coordinates)
    }

    hasCoordinate = (x, y) => {
        return this.coordinates.has(x, y)
    }

    getCoordinate = (x, y) => {
        return this.coordinates.get(x, y)
    }

    getState = () => {
        return this.state.get()
    }

    setEmitter = (fns) => {
        this._mappedGeometry = this.coordinates.map((x, y) => {
            const emission = fns[0](x, y, this.shape)
            return emission
        })
        
        this.emitFn = fns[1]
    }

    // should return effect
    emit = (x, y) => {
        // TODO: add more generic version of copy to allow other values than primitives as items of array
        const effect = copy(this._mappedGeometry.get(x, y))
        const emission = this.emitFn(
            x,
            y,
            effect,
            this.getState(),
            this.previousEmissions.get(x, y)
        )
        this.previousEmissions.set(x, y, emission)
            
        return emission
    }

    update = () => {
        this.updateIndex += 1
    }
}

export const createEnvironment = (shape, state, emitter, weight = 1) => {
    const environment = new Environment({
        shape,
        state,
        emitter,
        weight
    })

    return environment
}

