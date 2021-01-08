let ScryptaCore = require("@scrypta/core")
const scrypta = new ScryptaCore(true)
const ScryptaDB = require('./db')
const db = new ScryptaDB(true)

module.exports.check = async function check() {
    return new Promise(response => {
        if (chrome !== undefined && chrome.tabs !== undefined) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: 'check' }, function (page) {
                    if (page !== false) {
                        response(page)
                    } else {
                        response(false)
                    }
                });
            });
        } else {
            response(false)
        }
    })
}

module.exports.tosign = async function check() {
    return new Promise(response => {
        if (chrome !== undefined && chrome.tabs !== undefined) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: 'tosign' }, function (page) {
                    if (page !== false) {
                        response(page)
                    } else {
                        response(false)
                    }
                });
            });
        } else {
            response(false)
        }
    })
}

module.exports.dismiss = async function dismiss() {
    return new Promise(response => {
        if (chrome !== undefined && chrome.tabs !== undefined) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: 'dismiss' }, function (page) {
                    response(true)
                });
            });
        } else {
            response(false)
        }
    })
}

module.exports.confirm = async function confirm(tx) {
    return new Promise(response => {
        if (chrome !== undefined && chrome.tabs !== undefined) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: 'confirm', tx: tx }, function (page) {
                    response(true)
                });
            });
        } else {
            response(false)
        }
    })
}

module.exports.inject = async function inject(wallet) {
    return new Promise(response => {
        if (chrome !== undefined && chrome.tabs !== undefined) {
            if (wallet !== undefined) {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { method: 'inject', wallet: wallet }, function (page) {
                        response(page)
                    });
                });
            } else {
                response(false)
            }
        } else {
            response(false)
        }
    })
}

module.exports.disconnect = async function disconnect() {
    return new Promise(response => {
        if (chrome !== undefined && chrome.tabs !== undefined) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { method: 'disconnect' }, function (page) {
                    response(page)
                });
            });
        } else {
            response(false)
        }
    })
}