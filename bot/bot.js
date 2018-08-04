const Bot = require('slackbots')
const {setWsHeartbeat} = require('ws-heartbeat/client')
import {
    botName,
    startListening,
    help
} from '../config/constants'

import {
    setFrontPageInterval,
    pingSite,
    getEmojiList,
    showImage,
    doSomething,
    showChart,
    showHelp,
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
    pingSite()
    setCorrectChannel()
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
        const listenerString = commands.shift().toLowerCase()
        if (listenerString === 'do' && commands[0] === 'something') {
            console.log('doing something')
            doSomething(commands[1], data.channel)
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
                        const chartBuilt = showChart(commands[1], commands[2])
                        if (chartBuilt) showImage('chart', 'jpg')
                        break
                    case isMeme(commands):
                        showImage(commands.join(' '), 'png')
                        break
                    default:
                        const coins = textData.substr(listenerString.length, textData.length)
                        showCoins(coins, listenerString)
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