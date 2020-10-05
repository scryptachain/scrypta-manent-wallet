console.log('Scrypta Manent Wallet injected, now able to use it.')
browser.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.injectID) {
            console.log('InjectingID: ' + request.injectID)
            localStorage.setItem('SID', request.injectID)
            sendResponse(window.location.hostname)
            location.reload()
        }
    })