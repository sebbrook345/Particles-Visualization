class Particle {
    constructor(state, props, resolve) {
        this.state = state
        this.position = this.state.position
        this.positionFloor = []
        this.props = props
        this.resolve = resolve
    }

    getPosition = () => {
        this.positionFloor[0] = Math.floor(this.state.position[0])
        this.positionFloor[1] = Math.floor(this.state.position[1])

        return this.positionFloor
    }

    applyEffect = (effect) => {
        this.resolve.forEach(resolve => {
            resolve(effect, this.state, this.props)
        })

        this.step += 1
    }

    toString = () => {
        return this.state
    }
}

// resolvers
const forcePolarityResolver = (effect, state, props) => {
    state.position[0] = state.position[0] + state.velocity[0]
    state.position[1] = state.position[1] + state.velocity[1]

    if (effect) {
        state.polarity += effect[2]

        const force = [
            (effect[0] * effect[2]) / props.mass,
            (effect[1] * effect[2]) / props.mass
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

const frictionResolver = (effect, state, props) => {
    state.velocity[0] *= .995
    state.velocity[1] *= .995
    // limit velocity
    const veloMag = Math.sqrt(state.velocity[0] * state.velocity[0] + state.velocity[1] * state.velocity[1])

    if (veloMag > props.maxSpeed) {
        state.velocity[0] *= (props.maxSpeed / veloMag)
        state.velocity[1] *= (props.maxSpeed / veloMag)
    }

    state.position[0] = state.position[0] + state.velocity[0]
    state.position[1] = state.position[1] + state.velocity[1]
}

const forceResolver = (effect, state, props) => {
    state.position[0] = state.position[0] + state.velocity[0]
    state.position[1] = state.position[1] + state.velocity[1]
    if (effect) {
        const force = [
            effect[1] /= props.mass,
            effect[0] /= props.mass
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

const healthResolver = (effect, state, props) => {
    if (effect) {
        state.health -= .001
        
        if (state.health < 0.5 || Math.sqrt(state.velocity[0] * state.velocity[0] + state.velocity[1] * state.velocity[1]) < 0.01) {
            state.health = 0
        }
    }
}

export const createParticle = (state, props) => {
    return new Particle(state, props, [frictionResolver, healthResolver])
}