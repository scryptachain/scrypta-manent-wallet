let ScryptaCore = require("@scrypta/core")
const scrypta = new ScryptaCore(true)
const ScryptaDB = require('./db')

module.exports.auth = async function auth() {
    scrypta.staticnodes = true
    let wallet = await scrypta.returnDefaultxSid()
    let defaultid = await localStorage.getItem('default')
    if(defaultid === null){
        if(wallet !== false && wallet !== ''){
            try{
                let SIDS = wallet.split(":")
                let xpub = SIDS[0];
                let master = await scrypta.deriveKeyfromXPub(xpub, 'm/0')
                return {
                    xsid: wallet.wallet,
                    xpub: xpub,
                    label: wallet.label,
                    master: master.pub
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
                        master: address
                    }
                }catch(e){
                    return false
                }
            }else{
                return false
            }
        }
    }else{
        if(defaultid.indexOf('xpub') !== -1){
            let SIDS = wallet.split(":")
            let xpub = SIDS[0];
            let master = await scrypta.deriveKeyfromXPub(xpub, 'm/0')
            return {
                xsid: wallet.wallet,
                xpub: xpub,
                label: wallet.label,
                master: master.pub
            }
        }else{
            let SIDS = defaultid.split(":")
            let address = SIDS[0];
            wallet = await scrypta.returnIdentity(address)
            return {
                sid: wallet.wallet,
                address: address,
                label: wallet.label,
                master: address
            }
        }
    }
}

module.exports.configs = async function configs() {
    return new Promise(async response => {
        const db = new ScryptaDB(true)
        
        let language = await db.get('settings', 'set', 'language')
        if(!language){
            language = 'en'
            await db.put('settings', { set: 'language', value: 'en' })
        }else{
            language = language.value
        }

        let chain = await db.get('settings', 'set', 'chain')
        if(!chain){
            chain = 'LYRA'
            await db.put('settings', { set: 'chain', value: 'LYRA' })
        }else{
            chain = chain.value
        }

        response({
            chain: chain,
            language: language
        })
    })

}