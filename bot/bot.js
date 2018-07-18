const Bot = require('slackbots')
import * as Api from './api'
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
    console.log('message received')
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
    Api.getCall(baseUrl + frontPage).then((response) => {
        const data = response.data
        let percentageCoin
        const coinArray = textData.trim().split(',')
        const split = coinArray[coinArray.length - 1].trim().split(' ')
        const btcPrice = data.find(coin => coin.short.toLowerCase() === 'btc').price
        if (split[1] === 'in') {
            console.log(split)
            const secondCoin = split[2] ? split[2] : 'btc'
            coinArray[coinArray.length - 1] = split[0]
            percentageCoin = data.find((coin) => coin.short.toLowerCase() === secondCoin.toLowerCase())
        }
        const filteredCoinArray = coinArray.filter((value, index, self) => {
            return self.indexOf(value.trim()) === index
        });
        console.log('made it')
        filteredCoinArray.forEach((coinName) => {
            console.log('coinname',coinName)
            const coin = data.find((responseCoin) => {
                return coinName.toLowerCase() === responseCoin.short.toLowerCase()
            })
            bot.postMessage(channel, formatSlackPost(coin, percentageCoin, btcPrice), params)
        })
    })
}

const showChart = async (commands) => {
    const coin = commands[2].toUpperCase()
    Api.getCall(baseUrl + chartPage + coin).then((response) => {
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

const formatSlackPost = (coin, percentageCoin, btcPrice) => {
    console.log('formatting', coin)
    const symbol = coin.short
    const coinImage = emojiList && coin.short.toLowerCase() in emojiList ? coin.short : 'coincap'
    const coinComparedImage = emojiList && percentageCoin && percentageCoin.short.toLowerCase() in emojiList ? percentageCoin.short : percentageCoin ? 'coincap' : 'btc'
    const priceFiat = coin.price.toFixed(2)
    const perc = percentageCoin ? parseFloat(coin.perc - percentageCoin.perc).toFixed(2) : parseFloat(coin.perc).toFixed(2)
    const percPrice = percentageCoin ? parseFloat(coin.price / percentageCoin.price).toFixed(precision) : btcPrice ? parseFloat(coin.price / btcPrice).toFixed(precision) : 0
    const chart = getPercentageChart(perc)
    return `${symbol} :${coinImage}: $${priceFiat} :${coinComparedImage}: ${percPrice} ${chart} ${perc}%`
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