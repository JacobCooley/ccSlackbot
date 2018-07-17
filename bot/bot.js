const Bot = require('slackbots')
import * as Api from './api'
import {
    botName,
    baseUrl,
    coinString,
    channel,
    priceCheckText,
    chartTimeFrame,
    chartString,
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
let channelId

bot.on('start', (data) => {
    setCorrectChannel()
    getEmojiList()
})

bot.on('message', (data) => {
    console.log('data', data)
    if (data && data.text && (data.username || data.username !== botName) && data.channel && data.channel === channelId) {
        const textData = data.text
        console.log('textData', textData)
        if (textData.substr(0, 2).toLowerCase() === priceCheckText && textData.substr(2, 1) === ' ') {
            if (textData.substr(3, 5).toLowerCase() === 'chart') {
                bot.postMessage(channel, 'chart', params)
            }
            else {
                textData.substr(3).trim().split(',').forEach((coin) => {
                    Promise.resolve(Api.getCoin(baseUrl + coinString + coin.trim().toUpperCase())).then((response) => {
                        const data = response.data
                        bot.postMessage(channel, formatSlackPost(data), params)
                    })
                })
            }
        }
    }
})

const formatSlackPost = (data) => {
    const symbol = data.id
    const priceFiat = data.price_usd.toFixed(2)
    const priceBtc = data.price_btc.toFixed(8)
    const perc = Number.parseFloat(data.cap24hrChange).toFixed(2)
    const chart = perc > 75 ? positiveInsane : perc > 50 ? positiveHigh : perc > 25 ? positiveMed : perc > 10 ?
        positiveLow : perc > 0 ? positiveTiny : perc < -75 ? negativeInsane : perc < -50 ? negativeHigh : perc < -25 ?
            negativeMed : perc < -10 ? negativeLow : negativeTiny
    return `${symbol} :${symbol}: $${priceFiat} :BTC: ${priceBtc} ${chart} ${perc}%`
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

const

export default bot