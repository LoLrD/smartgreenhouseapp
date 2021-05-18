let client
let selectedRelay
const sensorsList = ['temperature', 'humidity', 'moisture']

window.onload = () => {
    if ("serviceWorker" in navigator) {
        self.addEventListener("load", async () => {
            const container = navigator.serviceWorker;
            if (container.controller === null) {
                const reg = await container.register("./sw.js");
            }
        });
    }
}

const isClientAvailable = () => {
    if (client && client.connected) {
        return true
    } else {
        return false
    }
}

const subscribeSensors = () => {
    if (isClientAvailable()) {
        client.subscribe(sensorsList)
    }
}

const setSensor = (topic, value) => {
    if (sensorsList.includes(topic)) {
        const element = document.querySelector(`#${topic}-text`)

        if (element) {
            element.textContent = value
        }
    }
}

const getSensorsValue = () => {
    if (isClientAvailable()) {
        client.publish('sensors', '1')
    }
}

const subscribeRelaysState = () => {
    if (isClientAvailable()) {
        for (let i = 1; i <= 4; i++) {
            sensorsChannels = [`relay_state/${i}`, `relay_timer_state/${i}`, `relay_sensor_state/${i}`]
            client.subscribe(sensorsChannels)
        }
    }
}

const showRelayState = (topic, value) => {
    if (topic.includes('relay_state')) {
        const relayNumber = topic.slice(-1)
        const relayStateText = document.querySelector(`#relay-state-${relayNumber}`)
        if (relayStateText) {
            value = parseInt(value)
            relayStateText.textContent = value ? 'Enable' : 'Disable'

            const disableRelayButton = document.querySelector(`#relay-${relayNumber}-disable-button`)
            const enableRelayButton = document.querySelector(`#relay-${relayNumber}-enable-button`)

            if (value) {
                disableRelayButton.classList.remove('disabled')
                enableRelayButton.classList.add('disabled')
            } else {
                disableRelayButton.classList.add('disabled')
                enableRelayButton.classList.remove('disabled')
            }
        }
    }

    showRelayTimerState(topic, value)
    showRelaySensorState(topic, value)
}

const showRelayTimerState = (topic, value) => {
    if (topic.includes('relay_timer_state')) {
        const relayNumber = topic.slice(-1)
        const relayTimerStateText = document.querySelector(`#relay-timer-state-${relayNumber}`)
        if (relayTimerStateText) {
            const isEnabled = parseInt(value.slice(0, 1))
            const disableRelayTimerButton = document.querySelector(`#relay-timer-${relayNumber}-disable-button`)

            if (isEnabled) {
                value = value.split('/')
                relayTimerStateText.textContent = `every ${value[1] / 1000} s. for ${value[2] / 1000} s.`

                disableRelayTimerButton.classList.remove('disabled')
            } else {
                relayTimerStateText.textContent = 'Disable'

                disableRelayTimerButton.classList.add('disabled')
            }
        }
    }
}

const showRelaySensorState = (topic, value) => {
    if (topic.includes('relay_sensor_state')) {
        const relayNumber = topic.slice(-1)
        const relaySensorStateText = document.querySelector(`#relay-sensor-state-${relayNumber}`)
        if (relaySensorStateText) {
            const isEnabled = parseInt(value.slice(0, 1))
            const disableRelaySensorButton = document.querySelector(`#relay-sensor-${relayNumber}-disable-button`)

            if (isEnabled) {
                value = value.split('/')
                let sensor
                if (value[1] === '0') {
                    sensor = 'Air temperature'
                } else if (value[1] === '1') {
                    sensor = 'Air humidity'
                } else if (value[1] === '2') {
                    sensor = 'Soil moisture'
                }

                relaySensorStateText.textContent = `${sensor}, treshold: ${value[2]}`

                disableRelaySensorButton.classList.remove('disabled')
            } else {
                relaySensorStateText.textContent = 'Disable'

                disableRelaySensorButton.classList.add('disabled')
            }
        }
    }
}

const getRelayStates = () => {
    if (isClientAvailable()) {
        for (let i = 1; i <= 4; i++) {
            client.publish(`relay/${i}`, '2')
            client.publish(`relay_timer/${i}`, '2')
            client.publish(`relay_sensor/${i}`, '2')
        }
    }
}

const setRelayState = (relayNumber, state) => {
    if (isClientAvailable()) {
        client.publish(`relay/${relayNumber}`, state)
    }
}

const setRelayTimerState = (relayNumber, state) => {
    if (isClientAvailable()) {
        if (state === '0') {
            client.publish(`relay_timer/${relayNumber}`, state)
        } else if (state === '1') {
            const period = parseInt(document.querySelector('#period').value) * 1000
            const work = parseInt(document.querySelector('#work').value) * 1000

            client.publish(`relay_timer/${relayNumber}`, state)
            client.publish(`relay_timer/${relayNumber}`, period.toString())
            client.publish(`relay_timer/${relayNumber}`, work.toString())
        }
    }
}

const setRelaySensorState = (relayNumber, state) => {
    if (isClientAvailable()) {
        if (state === '0') {
            client.publish(`relay_sensor/${relayNumber}`, state)
        } else if (state === '1') {
            const sensor = document.querySelector('#sensor').value
            const treshold = document.querySelector('#treshold').value

            client.publish(`relay_sensor/${relayNumber}`, state)
            client.publish(`relay_sensor/${relayNumber}`, sensor)
            client.publish(`relay_sensor/${relayNumber}`, treshold)
        }
    }
}

const SensorPageHandler = () => {
    M.AutoInit()
    getSensorsValue()

    const updateSensorsValueButton = document.querySelector('#update-sensors-value-buttons')
    updateSensorsValueButton.addEventListener('click', (e) => {
        e.preventDefault()

        getSensorsValue()

        M.toast({ html: 'Sensors values updated' })
    })
}

const RelayPageHandler = () => {
    M.AutoInit()

    const timerModalEl = document.querySelector('#timer-modal')
    const timerModal = M.Modal.init(timerModalEl);

    const sensorModalEl = document.querySelector('#sensor-modal')
    const sensorModal = M.Modal.init(sensorModalEl);

    getRelayStates()

    for (let i = 1; i <= 4; i++) {
        const enableButton = document.querySelector(`#relay-${i}-enable-button`)
        enableButton.addEventListener('click', e => {
            e.preventDefault()

            setRelayState(i, '1')
        })

        const disableButton = document.querySelector(`#relay-${i}-disable-button`)
        disableButton.addEventListener('click', e => {
            e.preventDefault()

            setRelayState(i, '0')
        })

        const disableTimerButton = document.querySelector(`#relay-timer-${i}-disable-button`)
        disableTimerButton.addEventListener('click', e => {
            e.preventDefault()

            setRelayTimerState(i, '0')
        })

        const disableSensorButton = document.querySelector(`#relay-sensor-${i}-disable-button`)
        disableSensorButton.addEventListener('click', e => {
            e.preventDefault()

            setRelaySensorState(i, '0')
        })
    }

    const openModalButtons = document.querySelectorAll('.relay-modal')
    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedRelay = button.dataset.relay
        })
    })

    const enableTimerButton = document.querySelector('#enable-timer-button')
    enableTimerButton.addEventListener('click', e => {
        e.preventDefault()

        setRelayTimerState(selectedRelay, '1')
        timerModal.close()
    })

    const enableSensorButton = document.querySelector('#enable-sensor-button')
    enableSensorButton.addEventListener('click', e => {
        e.preventDefault()

        setRelaySensorState(selectedRelay, '1')
        sensorModal.close()
    })
}

window.location.hash = '#sensors'
window.dispatchEvent(new HashChangeEvent("hashchange"))

document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit()

    const elem = document.querySelector('#login-modal');
    const instance = M.Modal.init(elem, { dismissible: false });
    instance.open()

    const loginButton = document.querySelector('#login-button')
    loginButton.addEventListener('click', () => {
        const login = document.querySelector('#username').value
        const password = document.querySelector('#password').value

        client = mqtt.connect('wss://smartgreenhouseapp.online:8080', { username: login, password: password, reconnectPeriod: 0 })

        client.on('connect', function () {
            instance.close()

            subscribeSensors()
            getSensorsValue()

            subscribeRelaysState()
            getRelayStates()
        })

        client.on('message', function (topic, message) {
            message = message.toString()

            setSensor(topic, message)
            showRelayState(topic, message)
        })


        client.on('error', function (err) {
            console.log(err)
            client.end()
        })

        client.on('close', function () {
            if (instance.isOpen) {
                M.toast({ html: 'Wrong username/password. Please try again.' })
            }
        })
    })
});