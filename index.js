import Environment from './lib/particles/Environment.js'
import ParticleSystem from './lib/particles/System.js'
import { createEmitter } from './lib/particles/Emitter.js'
import { createParticle } from './lib/particles/Particle.js'
import Shapes from 'shapes'
import createDataset from 'sensor'
import DataState from './lib/data/state.js'

const start = async () => {
    /**
     * DATASETS
     */
    const dataset = await createDataset({
        input: [
            './recordings/20210113.csv'
        ],
        output: 'datasets/2021-01-18',
        override: false,
        bufferSize: 65536,
        movingAverages: [
            ['l', 20],
            ['l', 50],
            ['l', 200],
        ],
        iirs: [
            ['l', .99],
            ['l', .95],
        ],
        exclude: ['x', 'y', 'z']
    })

    const emitterDataset = await createDataset({
        input: [
            './recordings/20210113.csv'
        ],
        output: 'datasets/2021-01-18',
        override: false,
        bufferSize: 65536,
        movingAverages: [
            ['l', 20],
            ['l', 50],
            ['l', 200],
        ],
        iirs: [
            ['l', .99],
            ['l', .95],
        ],
        exclude: ['x', 'y', 'z']
    })

    const state = new DataState([dataset], [225], (datasets) => {
        const result = []
        for (let i = 0; i < datasets[0].length; i++) {
            result[i] = datasets[0][i][4]
        }
        return result
    })

    const emitterState = new DataState([emitterDataset], [100], datasets => {
        let strength = 0
        for (let i = 0; i < datasets[0].length; i++) {
            strength += datasets[0][i][4]
        }
        return strength / datasets[0].length
    })

    const createFlowfield = () => {
        const envs = []
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const env = createRectEnvironment({
                    rectangle: [i * 40, j * 40, 40, 40],
                    state: {
                        state: state,
                        index: i * j + i
                    },
                    weight: 1,
                    emitter: [
                        (x, y, shape) => {
                            return [1, 0]
                        },
                        (x, y, effect, state) => {
                            // effect = [1, 0]
                            effect[0] = Math.sin(state * 8)
                            effect[1] = Math.cos(state * 8)
                            // "health"
                            effect[2] = state

                            return effect
                        }
                    ]
                })
                envs.push(env)
            }
        }

        return envs
    }

    const createEnvironment = (shape, state, emitter, weight = 1) => {
        const environment = new Environment({
            shape,
            state,
            emitter,
            weight
        })

        return environment
    }

    const createRectEnvironment = ({
        rectangle,
        state,
        emitter,
        weight
    }) => createEnvironment(Shapes.rect(...rectangle), state, emitter, weight)

    const system = new ParticleSystem()
    system.addState(state)
    system.addState(emitterState)

    const envs = createFlowfield()

    const emitter = createEmitter({
        position: [Math.random() * 300, Math.random() * 300],
        velocity: [Math.random(), Math.random()]
    }, {
        mass: 1.0,
        maxForce: 0.01,
        maxSpeed: 0.05
    },
        emitterState,
        state,
        (internalState, emitterState) => {
            if (emitterState > 6.0) {
                return [
                    createParticle({
                        position: [internalState.position[0], internalState.position[1]],
                        velocity: [internalState.velocity[1], internalState.velocity[0]],
                        health: emitterState
                    }, {
                        mass: 1.0,
                        maxForce: 0.01,
                        maxSpeed: 0.2
                    })
                ]
            }
        }
    )

    system.addEmitter(emitter)

    envs.forEach(environment => system.addEnvironment(environment))
    system.start(true)

    let start = new Date()
    for (let i = 0; i < 100000; i++) {
        system.update()
    }
    system.image.save()
    console.log(Date.now() - start)
    
}

start()
