const Bot = require('slackbots')
const fs = require('fs')
const request = require('request-promise')
import {buildChart} from './chart'
import {
    botName,
    baseUrl,
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

const aws = require('aws-sdk');

let s3 = new aws.S3({
    botToken: process.env.slackBotCCToken,
    oauthToken: process.env.slackBotCCOauth,
    channel: process.env.slackBotChannel
})
const botToken = s3.config.botToken
const oathToken = s3.config.oauthToken
const channel = s3.config.channel
const params = {
    icon_emoji: ':ideas_by_nature:'
}

const bot = new Bot({
    token: botToken,
    name: botName
})
let channelId, emojiList, coinData

bot.on('start', (data) => {
    getFrontPage()
    setFrontPageInterval()
    setCorrectChannel()
    getEmojiList()
    console.log("Bot started")
    console.log("Listening on channel " + channel)
})

bot.on('message', (data) => {
    if (data && data.text && data.user && data.channel && data.channel === channelId) {
        const textData = data.text
        const commands = textData.split(" ")
        const listenerString = commands.shift()
        if (listenerString.toLowerCase() === startListening) {
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
                    console.log('made it')
                    const coins = textData.substr(listenerString.length, textData.length)
                    showCoin(coins)
            }
        }
    }
})

const isMeme = (commands) => {
    const memeString = commands.join(' ')
    const action = commands[0]
    switch (memeString.toLowerCase()){
        case 'sean':
            return action
            break
        case 'vincent margera':
            return action
            break
        case 'maybe':
            return action
            break
        default:
            return false
    }
}

const showChart = async (coin, time) => {
    const response = await request.get(baseUrl + chartPage + coin.toUpperCase()).catch(err => new Error(err))
    const data = JSON.parse(response)
    const marketCapGraph = data.market_cap
    const priceGraph = data.price
    const chartBuilt = await buildChart(coin, priceGraph, marketCapGraph)
    showImage('chart', 'jpg')
}

const showImage = async (name, ext) => {
    console.log('show', name)
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

const showCoin = (textData) => {
    let percentageCoin
    const coinArray = textData.trim().split(',')
    const split = coinArray[coinArray.length - 1].trim().split(' ')
    const btcPrice = coinData.find(coin => (coin.short.toLowerCase() === 'btc')).price
    if (split[1] === 'in') {
        const secondCoin = split[2] ? split[2] : 'btc'
        coinArray[coinArray.length - 1] = split[0]
        percentageCoin = coinData.find((coin) => coin.short.toLowerCase() === secondCoin.toLowerCase())
    }
    const filteredCoinArray = coinArray.filter((value, index, self) => self.indexOf(value === index));
    filteredCoinArray.forEach((coinName) => {
        coinData.find((responseCoin) => {
            if (responseCoin && responseCoin.short && coinName.trim().toLowerCase() === responseCoin.short.toLowerCase()) {
                return bot.postMessage(channel, formatSlackPost(responseCoin, percentageCoin, btcPrice), params)
            }
        })
    })
}

const getFrontPage = async () => {
    const response = await request.get(baseUrl + frontPage).catch(err => console.log('Error', err))
    coinData = JSON.parse(response)
}

const setFrontPageInterval = () => {
    setInterval(() => {
        console.log('frontcall')
        getFrontPage()
    }, 30000)
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