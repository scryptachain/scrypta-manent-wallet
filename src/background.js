console.log('Scrypta Manent Wallet injected, now able to use it!!')
browser.runtime.onMessage.addListener(
    function (request, sender) {
        if(request.method !== undefined){
            switch(request.method){
                case "inject": {
                    if(request.wallet !== undefined && request.wallet.indexOf('xpub') !== -1){
                        localStorage.setItem('xSID', request.wallet)
                        location.reload()
                    }else if(request.wallet !== undefined && request.wallet.indexOf('xpub') === -1){
                        localStorage.setItem('SID', request.wallet)
                        location.reload()
                    }
                    break;
                }
                case "check": {
                    let sid = localStorage.getItem('SID')
                    let xsid = localStorage.getItem('xSID')
                    return Promise.resolve({dapp: window.location.hostname, sid: sid, xsid: xsid })
                }
                case "disconnect": {
                    localStorage.removeItem('SID')
                    localStorage.removeItem('xSID')
                    location.reload()
                }
            }
        }
    }
)
