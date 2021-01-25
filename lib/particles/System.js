import Grid from '../grid/Grid.js'
import Image from '../image/index.js'

const add = (a, b, out) => {
    for (let i = 0; i < out.length; i++) {
        out[i] = (a[i] || 0) + (b[i] || 0)
    }

    return out
}

const mult = (a, b, out) => {
    for (let i = 0; i < out.length; i++) {
        out[i] = (a[i]) * b
    }

    return out
}

const sub = (a, b, out = a) => {
    if (out.length === 2) {
        out[0] = a[0] - b[0]
        out[1] = a[1] - b[1]
    }

    return out
}

const create = (...values) => {
    return values
}

const length = (a) => a.length

const isNull = v => v.every(e => e === 0)

const mag = (a, s, out = a) => {
    if (length(a) > s) {

    }
}

export default class ParticleSystem {
    constructor() {
        this.coordinates = new Grid()
        this.environments = new Grid()
        this.weightedEnvironments = new Grid()
        this.emissions = new Grid()
        this.particles = []
        /**
         * store data states
         */
        this.states = []
        this.step = 0
        this.image = new Image({
            resolution: 10
        })
        this.emitters = []
    }

    addParticle = particle => {
        this.particles.push(particle)
    }

    addState = (state) => {
        this.states.push(state)
    }

    addEnvironment = environment => {
        // merge environment coordinates into particle coordinates => save environment references into coordinates
        // legacy?: this.environments.merge(environment.coordinates, (v0) => [...(v0 || []), environment].filter(Boolean))
        this.emissions.merge(environment.coordinates, (current, acc, x, y) => {
            // initial values
            current = current || {}
            current.environments = (current.environments) || []
            current.weight = (current.weight) || 0
            // current.effectDimension = (current.effectDimension) || 0

            current.environments = [...current.environments, environment].filter(Boolean)
            current.weight = current.weight + environment.weight
            // current.effectDimension = Math.max(current.effectDimension, environment.emit(x,y).length)

            return current
        })
    }

    addEmitter = emitter => this.emitters.push(emitter)

    start = () => {
        this.emissions = this.emissions.map((x, y, { environments, weight }) => {
            return {
                value: (() => {
                    let memoIdx = -1
                    // hardcoded! remove!!
                    let memoValue = [0, 0, 0, 0]
                    // let memoValue = null

                    return () => {
                        if (memoIdx === this.step) {
                            return memoValue
                        }

                        mult(memoValue, 0, memoValue)

                        // add effects
                        environments.forEach(env => {
                            add(memoValue, env.emit(x, y), memoValue)
                        })

                        memoIdx = this.step

                        // weight effect
                        mult(memoValue, 1 / weight, memoValue)

                        // return effect
                        return memoValue
                    }
                })()
            }
        })
    }

    bounds = (particle) => {
        if (particle.state.position[0] > 400) {
            particle.state.position[0] = 0
        }
        if (particle.state.position[0] < 0) {
            particle.state.position[0] = 400
        }
        if (particle.state.position[1] > 400) {
            particle.state.position[1] = 0
        }
        if (particle.state.position[1] < 0) {
            particle.state.position[1] = 400
        }
    }

    emit = (x, y) => {
        const emission = this.emissions.get(x, y)
        return emission && emission.value()
    }

    update = () => {
        this.step += 1
        this.states.forEach(state => state.update())
        this.emitters.forEach(emitter => {
            emitter.applyEffect(this.emit(Math.floor(emitter.state.position[0]), Math.floor(emitter.state.position[1])))
            this.bounds(emitter)
            emitter.emit()
            emitter.particles.forEach(particle => {
                const position = particle.getPosition()
                particle.applyEffect(this.emit(position[0], position[1]))
                this.bounds(particle)
                this.image.update(particle.state.position)
            })
        })
    }
}