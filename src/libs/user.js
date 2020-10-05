let ScryptaCore = require("@scrypta/core")
const scrypta = new ScryptaCore(true)

module.exports.auth = async function auth() {
    scrypta.staticnodes = true
    let wallet = await scrypta.returnDefaultxSid()
    if(wallet !== false){
        try{
            let SIDS = wallet.split(":")
            let address = SIDS[0];
            return {
                identity: wallet.wallet,
                address: address
            }
        }catch(e){
            return false
        }
    }else{
        return false
    }
}
