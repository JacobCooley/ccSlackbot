const Bot = require('slackbots')
import {
    botName,
    startListening,
    help
} from '../config/constants'

import {
    getFrontPage,
    setFrontPageInterval,
    pingSite,
    getEmojiList,
    showImage,
    showChart,
    showHelp,
    showCoinCC,
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
    getFrontPage()
    setFrontPageInterval()
    pingSite()
    setCorrectChannel()
    getEmojiList()
    console.log("Listening on channel " + s3.channel)
})

bot.on('message', (data) => {
    if (data && data.text && data.user && data.channel && data.channel === channelId) {
        const textData = data.text
        const commands = textData.split(" ")
        const listenerString = commands.shift().toLowerCase()
        console.log('lis',listenerString)
        if (listenerString === startListening) {
            const action = commands[0]
            switch (action) {
                case 'help':
                    showHelp()
                    break
                case 'chart':
                    showChart(commands[1], commands[2])
                    break
                case isMeme(commands):
                    showImage(commands.join(' '), 'png')
                    break
                default:
                    const coins = textData.substr(listenerString.length, textData.length)
                    console.log(listenerString === 'cc')
                    listenerString === 'cc' ? showCoinCC(coins) : null
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