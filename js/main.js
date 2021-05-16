let client
const sensorsList = ['temperature', 'humidity', 'moisture']

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
}

const getRelayStates = () => {
    if (isClientAvailable()) {
        for (let i = 1; i <= 4; i++) {
            client.publish(`relay/${i}`, '2')
        }
    }
}

const setRelayState = (relayNumber, state) => {
    if (isClientAvailable()) {
        client.publish(`relay/${relayNumber}`, state)
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

    getRelayStates()

    for (let i = 1; i <= 4; i++) {
        const enableButton = document.querySelector(`#relay-${i}-enable-button`)
        enableButton.addEventListener('click', (e) => {
            e.preventDefault()

            setRelayState(i, '1')
        })

        const disableButton = document.querySelector(`#relay-${i}-disable-button`)
        disableButton.addEventListener('click', (e) => {
            e.preventDefault()

            setRelayState(i, '0')
        })
    }
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

        client = mqtt.connect('ws://198.251.77.162:443', { username: login, password: password, reconnectPeriod: 0 })

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