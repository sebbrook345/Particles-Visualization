class SensorDataState {
    constructor(sensors, readSizes, transform) {
        this.sensors = sensors
        this.state = []
        this.prevState = []
        this.readSizes = readSizes
        this.transform = transform
    }

    getPrevState = () => this.prevState
    getState = () => this.state

    update = () => {
        // read from sensor
        this.prevState = this.state
        const readings = this.sensors.map((sensor, i) => sensor.read(this.readSizes[i]))
        this.state = this.transform(readings)
    }
}

export default SensorDataState