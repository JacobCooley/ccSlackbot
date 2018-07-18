const Bot = require('slackbots')
const fs = require('fs')
const request = require('request-promise')
import {buildChart} from './chart'

import {
    botName,
    baseUrl,
    coinPage,
    channel,
    startListening,
    chartTimeFrame,
    chartPage,
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
    frontPage,
    precision,
} from '../config/constants'

import {
    botToken,
    oathToken
} from '../config/secrets'

const settings = {
    token: botToken,
    name: botName
}

const params = {
    icon_emoji: ':coincap:'
}

const bot = new Bot(settings)
let channelId, emojiList, btcPrice

bot.on('start', (data) => {
    setCorrectChannel()
    getEmojiList()
})

bot.on('message', (data) => {
    if (data && data.text && data.user && data.channel && data.channel === channelId) {
        const textData = data.text
        const commands = textData.split(" ")
        if (commands[0] === startListening) {
            switch (commands[1]) {
                case 'help':
                    showHelp()
                    break
                case 'chart':
                    showChart(commands[2], commands[3])
                    break
                case 'sean':
                    showImage(commands[1], 'png')
                    break
                default:
                    const coins = textData.substr(commands[0].length, textData.length)
                    showCoin(coins)
            }
        }
    }
})

const showChart = async (coin, time) => {
    console.log('coin', coin)
    console.log('time', time)
    const response = await request.get(baseUrl + chartPage + coin.toUpperCase()).catch(err => new Error(err))
    const data = JSON.parse(response)
    const marketCapGraph = data.market_cap
    const priceGraph = data.price
    const chartBuilt = await buildChart(priceGraph, marketCapGraph)
    console.log('chart', chartBuilt)
    showImage('chart', 'jpg')
}

const showImage = async (name, ext) => {
    const options = {
        method: 'POST',
        url: 'https://slack.com/api/files.upload',
        formData: {
            token: botToken,
            channels: channel,
            file: fs.createReadStream(`${__dirname}/images/${name}.${ext}`),
            filename: `${name}.${ext}`,
            filetype: `${ext}`
        }
    }
    return request(options).catch(err => console.error(new Error(err)))
}

const showCoin = async (textData) => {
    const response = await request.get(baseUrl + frontPage).catch(err => console.log('Error', err))
    const data = JSON.parse(response)
    let percentageCoin
    const coinArray = textData.trim().split(',')
    const split = coinArray[coinArray.length - 1].trim().split(' ')
    const btcPrice = data.find(coin => (coin.short.toLowerCase() === 'btc')).price
    if (split[1] === 'in') {
        const secondCoin = split[2] ? split[2] : 'btc'
        coinArray[coinArray.length - 1] = split[0]
        percentageCoin = data.find((coin) => coin.short.toLowerCase() === secondCoin.toLowerCase())
    }
    const filteredCoinArray = coinArray.filter((value, index, self) => self.indexOf(value === index));
    filteredCoinArray.forEach((coinName) => {
        data.find((responseCoin) => {
            if (responseCoin && responseCoin.short && coinName.trim().toLowerCase() === responseCoin.short.toLowerCase()) {
                return bot.postMessage(channel, formatSlackPost(responseCoin, percentageCoin, btcPrice), params)
            }
        })
    })
}

const showHelp = () => {
    bot.postMessage(channel, help, params)
}

const formatSlackPost = (coin, percentageCoin, btcPrice) => {
    const symbol = coin.short
    const coinImage = emojiList && coin.short.toLowerCase() in emojiList ? coin.short : 'coincap'
    const coinComparedImage = emojiList && percentageCoin && percentageCoin.short.toLowerCase() in emojiList ? percentageCoin.short : percentageCoin ? 'coincap' : 'btc'
    const priceFiat = coin.price.toFixed(2)
    const perc = percentageCoin ? parseFloat(coin.perc - percentageCoin.perc).toFixed(2) : parseFloat(coin.perc).toFixed(2)
    const percPrice = percentageCoin ? parseFloat(coin.price / percentageCoin.price).toFixed(precision) : btcPrice ? parseFloat(coin.price / btcPrice).toFixed(precision) : 0
    const chart = getPercentageImage(perc)
    return `${symbol} :${coinImage}: $${priceFiat} :${coinComparedImage}: ${percPrice} ${chart} ${perc}%`
}

const setCorrectChannel = () => {
    bot.getChannels().then((channelList) => {
        for (let channelInArray of channelList.channels) {
            if (channelInArray.name === channel) {
                channelId = channelInArray.id
                break
            }
        }
    })
}

const getEmojiList = async () => {
    const response = await request.get(`https://slack.com/api/emoji.list?token=${oathToken}`).catch(err => console.log(new Error(err)))
    emojiList = JSON.parse(response).emoji
}

const getPercentageImage = (perc) => {
    return perc > 40 ? positiveInsane : perc > 30 ? positiveHigh : perc > 20 ? positiveMed : perc > 10 ?
        positiveLow : perc >= 0 ? positiveTiny : perc < -40 ? negativeInsane : perc < -30 ? negativeHigh : perc < -20 ?
            negativeMed : perc < -10 ? negativeLow : negativeTiny
}

export default bot