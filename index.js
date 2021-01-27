import { createEnvironment } from './lib/particles/Environment.js'
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

    const state = new DataState([dataset], [225], (datasets) => {
        const result = {
            flowfield: [],
            emitter: 0
        }
        for (let i = 0; i < datasets[0].length; i++) {
            const value = datasets[0][i][4]
            result.flowfield[i] = value
            result.emitter += value
        }

        result.emitter /= datasets[0].length
        return result
    })

    const createFlowfield = () => {
        const envs = []
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const env = createRectEnvironment({
                    rectangle: [i * 40, j * 40, 40, 40],
                    state: {
                        get: () => state.getState().flowfield[i * j + i]
                    },
                    emitter: [
                        (x, y, shape) => {
                            return [1, 0]
                        },
                        (x, y, effect, state, prevEffect) => {
                            // effect = [1, 0]
                            // save state as rotation as [4]

                            // const v = state * 0.01 + 0.99 * ((prevEffect && prevEffect[4]) || 0)
                            const v = ((prevEffect && prevEffect[4]) || 0) + state

                            effect[0] = Math.sin(v * 6)
                            effect[1] = Math.cos(v * 6)
                            effect[4] = v

                            // effect[0] = Math.sin(state * 8)
                            // effect[1] = Math.cos(state * 8)

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

    const createRectEnvironment = ({
        rectangle,
        state,
        emitter,
        weight = 1
    }) => createEnvironment(Shapes.rect(...rectangle), state, emitter, weight)

    const system = new ParticleSystem()
    system.addState(state)

    const envs = createFlowfield()

    const emitter = createEmitter({
        position: [Math.random() * 300, Math.random() * 300],
        velocity: [0, 0]
    }, {
        mass: 1.0,
        maxForce: 0.01,
        maxSpeed: 0.05
    },
        {
            get: () => state.getState().emitter
        },
        (internalState, emitterState) => {
            if (emitterState > 2.0) {
                const velocity = [internalState.velocity[1], internalState.velocity[0]]
                // const length = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1])
                // velocity[0] /= length
                // velocity[1] /= length
                return [
                    createParticle({
                        position: [internalState.position[0], internalState.position[1]],
                        velocity: Math.random() > 0.5 ? velocity : [-velocity[0], -velocity[1]],
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
    let average = 0
    for (let i = 0; i < 100000; i++) {
        system.update()
        average += system.emitters[0].particles.length
    }
    console.log(average / 100000)
    system.image.save()
    console.log(Date.now() - start)

}

start()
