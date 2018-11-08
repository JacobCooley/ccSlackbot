const Bot = require('slackbots')
const {setWsHeartbeat} = require('ws-heartbeat/client')
import {
    botName
} from '../config/constants'
import {
    startListening,
    help
} from '../config/app-constants'

import {
    setFrontPageInterval,
    getEmojiList,
    showImage,
    doSomething,
    showChart,
    showHelp,
    displayTop,
    pingSite,
    showCoins,
    isMeme
} from './helper'

const aws = require('aws-sdk');

export const s3 = new aws.S3({
    botToken: process.env.slackBotCCToken,
    oauthToken: process.env.slackBotCCOauth,
    channel: process.env.slackBotChannel
}).config

const bot = new Bot({
    token: s3.botToken,
    name: botName
})

let channelId


bot.on('start', (data) => {
    console.log("Bot started")
    setFrontPageInterval()
    setCorrectChannel()
	pingSite()
    getEmojiList()
    console.log("Listening on channel " + s3.channel)
})

bot.on('open', () => {
    setWsHeartbeat(bot.ws, '{ "kind": "ping" }');
})

bot.on('message', (data) => {
    console.log('receiving message')
    if (data && data.text && data.user) {
        const textData = data.text
        const commands = textData.split(" ")
        let baseCoin
        const listenerString = commands.shift().toLowerCase()
        if (listenerString === 'do' && commands[0] === 'something') {
            console.log('doing something')
            doSomething(commands[1])
            return
        }
        if(commands[commands.length - 2] === 'in'){
            baseCoin = commands.pop()
            commands.pop()
        }
        if (data.channel && data.channel === channelId) {
            console.log('Listening on channel ' + data.channel)
            if (startListening.includes(listenerString)) {
                const action = commands[0]
                switch (action) {
                    case 'help':
                        showHelp()
                        break
                    case 'chart':
                    case 'charts':
                        showChart(false, commands[1], commands[2], baseCoin).then(() => `Chart ${commands[1]} in ${baseCoin} shown`)
                        break
                    case 'ta':
                        showChart(true, commands[1], commands[2], baseCoin).then(() => `Chart ${commands[1]} in ${baseCoin} shown`)
                        break
                    case 'top':
                        displayTop(commands[1], commands[2])
                        break
                    case isMeme(commands):
                        showImage(commands.join(' '), 'png')
                        break
                    default:
                        showCoins(commands.join(), listenerString, baseCoin)
                }
            }
        }
    }
})

const setCorrectChannel = () => {
    bot.getChannels().then((channelList) => {
        for (let channelInArray of channelList.channels) {
            if (channelInArray.name === s3.channel) {
                channelId = channelInArray.id
                break
            }
        }
    })
}

export default bot