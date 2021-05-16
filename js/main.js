let client

const isClientAvailable = () => {
    if (client && client.connected) {
        return true
    } else {
        return false
    }
}

const subscribeSensors = () => {
    if (isClientAvailable()) {
        sensorsChannels = ['temperature', 'humidity', 'moisture']
        client.subscribe(sensorsChannels)
    }
}

const setSensor = (topic, value) => {
    const element = document.querySelector(`#${topic}-text`)

    if (element) {
        element.textContent = value
    }
}

const getSensorsValue = () => {
    if (isClientAvailable()) {
        client.publish('sensors', '1')
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
        })

        client.on('message', function (topic, message) {
            message = message.toString()

            setSensor(topic, message)
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