const chalk = require('chalk');

let errorMessages = {
    "client":{
        "answer":{
            "buffer":{
                "isEmpty": chalk.red("Client answer Buffer is empty. Make sure the host's last request is dealt with.")
            },
            "array": {
                "isEmpty": chalk.red("Client answer Array is empty. Make sure the host's last request is dealt with.")
            },
            "undefined": chalk.red("Client answer type is either undefined or an invalid type. It must be either an array or a buffer.")
        }
    }
}

module.exports = errorMessages;