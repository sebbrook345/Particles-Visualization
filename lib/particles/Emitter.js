class Emitter {
    constructor({
        emitterDataState,
        state,
        emitFn,
        resolve,
        props
    }) {
        this.emitterDataState = emitterDataState
        this.state = state
        this.resolve = resolve
        this.props = props
        this.particles = []
        this.emitFn = emitFn
    }

    applyEffect = (effect) => {
        this.resolve.forEach(
            resolve => resolve(effect, this.state, this.props)
        )
    }

    emit = () => {
        // returns particles
        this.particles = [
            ...this.particles.filter(p => p.state.health > 0),
            ...(this.emitFn(this.state, this.emitterDataState.get()) || [])
        ]
    }

    update = () => {
        this.particles = this.particles.filter(p => p.state.health > 0)
    }
}

const forceResolver = (effect, state, props) => {
    state.position[0] = state.position[0] + state.velocity[0]
    state.position[1] = state.position[1] + state.velocity[1]
    if (effect) {
        const force = [
            effect[0] /= props.mass,
            effect[1] /= props.mass
        ]

        // limit force
        const forceMag = Math.sqrt(force[0] * force[0] + force[1] * force[1])

        if (forceMag > props.maxForce) {
            force[0] *= (props.maxForce / forceMag)
            force[1] *= (props.maxForce / forceMag)
        }

        state.velocity[0] = state.velocity[0] + force[0]
        state.velocity[1] = state.velocity[1] + force[1]
    }

    // limit velocity
    const veloMag = Math.sqrt(state.velocity[0] * state.velocity[0] + state.velocity[1] * state.velocity[1])

    if (veloMag > props.maxSpeed) {
        state.velocity[0] *= (props.maxSpeed / veloMag)
        state.velocity[1] *= (props.maxSpeed / veloMag)
    }
}


export const createEmitter = (
    state,
    props,
    emitterDataState,
    emitFn
) => {
    return new Emitter({
        state,
        emitterDataState,
        props,
        emitFn,
        resolve: [forceResolver]
    })
}