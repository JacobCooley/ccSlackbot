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
                    showChart(commands)
                    break
                default:
                    const coins = textData.substr(commands[0].length, textData.length)
                    showCoin(coins)
            }
        }
    }
})

const showCoin = (textData) => {
    let percentageCoin
    const coinArray = textData.trim().split(',')
    const split = coinArray[coinArray.length - 1].trim().split(' ')
    if (split[1] === 'in') {
        const secondCoin = split[2] ? split[2] : 'BTC'
        coinArray[coinArray.length - 1] = split[0]
        Api.getCall(baseUrl + coinString + secondCoin.trim().toUpperCase()).then((response) => {
            percentageCoin = response.data
        })
    }
    coinArray.forEach((coin) => {
        Api.getCall(baseUrl + coinString + coin.trim().toUpperCase()).then((response) => {
            const data = response.data
            bot.postMessage(channel, formatSlackPost(data, percentageCoin), params)
        })
    })
}

const showChart = async (commands) => {
    const coin = commands[2].toUpperCase()
    Api.getCall(baseUrl + chartString + coin).then((response) => {
        const data = response.data
        const marketCapGraph = response.data.market_cap
        const priceGraph = response.data.price
        // if(coin !== 'BTC' && btcPrice) {
        //     const btcGraph = response.data.price.map((graphPoint) => {
        //         return [graphPoint[0], graphPoint[1] / btcPrice]
        //     })
        //     console.log(btcGraph)
        // }
    })
    bot.postMessage(channel, 'chart', params)
}

const showHelp = () => {
    bot.postMessage(channel, help, params)
}

const formatSlackPost = (data, percentageCoin) => {
    const symbol = data.id
    const coinImage = emojiList && data.id.toLowerCase() in emojiList ? data.id : 'coincap'
    const priceFiat = data.price.toFixed(2)
    const perc = percentageCoin ? parseFloat(data.cap24hrChange - percentageCoin.cap24hrChange).toFixed(2) : parseFloat(data.cap24hrChange).toFixed(2)
    const percPrice = percentageCoin ? parseFloat(data.price / percentageCoin.price).toFixed(precision) : data.btcPrice ? parseFloat(data.price / data.btcPrice).toFixed(precision) : 0
    const chart = getPercentageChart(perc)
    return `${symbol} :${coinImage}: $${priceFiat} :BTC: ${percPrice} ${chart} ${perc}%`
}

const setCorrectChannel = () => {
    Promise.resolve(bot.getChannels()).then((channelList) => {
        for (let channelInArray of channelList.channels) {
            if (channelInArray.name === channel) {
                channelId = channelInArray.id
                break
            }
        }
    })
}

const getEmojiList = () => {
    Promise.resolve(Api.getCall(`https://slack.com/api/emoji.list?token=${oathToken}&pretty=1`)).then((response) => {
        emojiList = response.data.emoji
    })
}

const getPercentageChart = (perc) => {
    return perc > 40 ? positiveInsane : perc > 30 ? positiveHigh : perc > 20 ? positiveMed : perc > 10 ?
        positiveLow : perc >= 0 ? positiveTiny : perc < -40 ? negativeInsane : perc < -30 ? negativeHigh : perc < -20 ?
            negativeMed : perc < -10 ? negativeLow : negativeTiny
}

export default bot