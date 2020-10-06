let ScryptaCore = require("@scrypta/core")
const scrypta = new ScryptaCore(true)

module.exports.auth = async function auth() {
    scrypta.staticnodes = true
    let wallet = await scrypta.returnDefaultxSid()
    if(wallet !== false && wallet !== ''){
        try{
            let SIDS = wallet.split(":")
            let xpub = SIDS[0];
            return {
                xsid: wallet.wallet,
                xpub: xpub,
                label: wallet.label,
                hash: xpub
            }
        }catch(e){
            return false
        }
    }else{
        await scrypta.importBrowserSID()
        let defaultid = await scrypta.returnDefaultIdentity()
        if(defaultid !== false && defaultid !== ''){
            try{
                let SIDS = defaultid.split(":")
                let address = SIDS[0];
                wallet = await scrypta.returnIdentity(address)
                return {
                    sid: wallet.wallet,
                    address: address,
                    label: wallet.label,
                    hash: address
                }
            }catch(e){
                return false
            }
        }else{
            return false
        }
    }
}
