console.log('Scrypta Manent Wallet injected, now able to use it!')
browser.runtime.onMessage.addListener(
    async function (request, sender) {
        if (request.method !== undefined) {
            switch (request.method) {
                case "inject": {
                    if (request.wallet !== undefined && request.wallet.indexOf('xpub') !== -1) {
                        localStorage.setItem('xSID', request.wallet)
                        location.reload()
                    } else if (request.wallet !== undefined && request.wallet.indexOf('xpub') === -1) {
                        localStorage.setItem('SID', request.wallet)
                        location.reload()
                    }
                    break;
                }
                case "check": {
                    let sid = await localStorage.getItem('SID')
                    let xsid = await localStorage.getItem('xSID')
                    return Promise.resolve({ dapp: window.location.hostname, sid: sid, xsid: xsid })
                }
                case "tosign": {
                    console.log('Scrypta Manent Wallet asking what to sign.')
                    let tosign = localStorage.getItem('ScryptaManentSign')
                    let message = localStorage.getItem('ScryptaManentMessage')
                    return Promise.resolve({ tosign: tosign, message: message })
                }
                case "dismiss": {
                    console.log('Scrypta Manent Wallet asking to dismiss transaction.')
                    localStorage.setItem('ScryptaManentSign', '')
                    localStorage.setItem('ScryptaManentMessage', '')
                    return Promise.resolve(true)
                }
                case "confirm": {
                    console.log('Scrypta Manent Wallet confirming transaction.')
                    localStorage.setItem('ScryptaManentConfirm', request.tx)
                    return Promise.resolve(true)
                }
                case "disconnect": {
                    localStorage.setItem('SID', '')
                    localStorage.setItem('xSID', '')
                    localStorage.setItem('wallet', '[]')
                    localStorage.setItem('xsid', '[]')
                    location.reload()
                }
            }
        }
    }
)