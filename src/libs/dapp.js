let ScryptaCore = require("@scrypta/core")
const scrypta = new ScryptaCore(true)
const ScryptaDB = require('./db')
const db = new ScryptaDB(true)

module.exports.check = async function check() {
    return new Promise(response => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: 'check' }, function (page) {
                if (page !== false) {
                    response(page)
                } else {
                    response(false)
                }
            });
        });
    })
}

module.exports.inject = async function inject(wallet) {
    return new Promise(response => {
        if(wallet !== undefined){
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: 'inject', wallet: wallet }, function (page) {
                    response(page)
                });
            });
        }else{
            response(false)
        }
    })
}

module.exports.disconnect = async function disconnect() {
    return new Promise(response => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: 'disconnect' }, function (page) {
                response(page)
            });
        });
    })
}