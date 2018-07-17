const Bot = require('slackbots')
import * as Api from './api'
import {
    botName,
    baseUrl,
    coinString,
    channel,
    startListening,
    chartTimeFrame,
    chartString,
    help,
    positiveInsane,
    positiveHigh,
    positiveMed,
    positiveLow,
    positiveTiny,
    negativeInsane,
    negativeHigh,
    negativeMed,
    negativeLow,
    negativeTiny,
    botToken,
    precision,
    oathToken
} from '../config/constants'

const settings = {
    token: botToken,
    name: botName
}

const params = {
    icon_emoji: ':coincap:'
}

const bot = new Bot(settings)
let channelId, emojiList

bot.on('start', (data) => {
    setCorrectChannel()
    getEmojiList()
})

bot.on('message', (data) => {
    console.log(data)
    if (data && data.text && data.user && data.channel && data.channel === channelId) {
        const textData = data.text
        const commands = textData.split(" ")
        if (commands[0] === startListening) {
            switch (commands[1]){
                case 'help':
                    showHelp()
                    break
                case 'chart':
                    showChart()
                    break
                default:
                    const coins = textData.substr(commands[0].length, textData.length)
                    showCoin(coins)
            }
        }
    }
})

const showCoin = (textData) => {
    textData.trim().split(',').forEach((coin) => {
        Promise.resolve(Api.getCall(baseUrl + coinString + coin.trim().toUpperCase())).then((response) => {
            const data = response.data
            bot.postMessage(channel, formatSlackPost(data), params)
        })
    })}

const showChart = async () => {
    bot.postMessage(channel, 'chart', params)
}

const showHelp = () => {
    bot.postMessage(channel, help, params)
}

const formatSlackPost = (data) => {
    console.log('data',data)
    const symbol = data.id
    const coinImage = emojiList && data.id.toLowerCase() in emojiList ? data.id : 'coincap'
    const priceFiat = data.price.toFixed(2)
    const priceBtc = data.price_btc ? data.price_btc.toFixed(precision) : data.btcPrice ? parseFloat(data.price / data.btcPrice).toFixed(precision) : 0
    const perc = parseFloat(data.cap24hrChange).toFixed(2)
    const chart = perc > 70 ? positiveInsane : perc > 40 ? positiveHigh : perc > 25 ? positiveMed : perc > 10 ?
        positiveLow : perc > 0 ? positiveTiny : perc < -70 ? negativeInsane : perc < -40 ? negativeHigh : perc < -25 ?
            negativeMed : perc < -10 ? negativeLow : negativeTiny
    return `${symbol} :${coinImage}: $${priceFiat} :BTC: ${priceBtc} ${chart} ${perc}%`
}

const setCorrectChannel = () => {
    Promise.resolve(bot.getChannels()).then((channelList) => {
        for (let channelInArray of channelList.channels) {
            if (channelInArray.name === channel) {
                channelId = channelInArray.id
                break
            }
        }
        console.log('Channel ID Found', channelId)
    })
}

const getEmojiList = () => {
    Promise.resolve(Api.getCall(`https://slack.com/api/emoji.list?token=${oathToken}&pretty=1`)).then((response) => {
        emojiList = response.data.emoji
    })
}

export default bot