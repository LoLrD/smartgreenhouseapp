window.onhashchange = () => {
    try {
        SPARouter(window.location.hash)
    } catch (err) {
        console.error(err)
    }
}

const SPARouter = async (page) => {
    switch (page) {
        case '':
        case '#':

        case '#sensors':
            await SPANav('./views/sensors.html')
            SensorPageHandler()
            break
        
        case '#relays':
            await SPANav('./views/relays.html')
            RelayPageHandler()
            break
    
        default:
            break
    }
}

const SPANav = async (to) => {
    const response = await fetch(to)
    const html = await response.text()
    const container = document.querySelector('.container')
    container.innerHTML = html
} 