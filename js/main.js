const SensorPageHandler = () => {
    M.AutoInit();
}

const RelayPageHandler = () => {
    M.AutoInit();
}

window.location.hash = '#sensors'
window.dispatchEvent(new HashChangeEvent("hashchange"))

document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
});