const request = require('request-promise')
const fs = require('fs')
import {
    baseUrlCC,
    baseUrlCMC,
    frontPageCMC,
    memes,
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
    frontPageCC,
    precision,
} from '../config/constants'
import bot, {s3} from './bot'
import {buildChart} from './chart'
const params = {
    icon_emoji: ':ideas_by_nature:'
}

let emojiList, coinDataCC, coinDataCMC

export const showCoins = (textData, listenerString) => {
    console.log('Showing coins')
    let percentageCoin
    const coinArray = textData.trim().split(',')
    const split = coinArray[coinArray.length - 1].trim().split(' ')
    const coinData = listenerString === 'cc' ? coinDataCC : coinDataCMC
    const btcPrice = coinData.find(coin => (coin.symbol.toLowerCase() === 'btc')).price
    if (split[1] === 'in') {
        const secondCoin = split[2] ? split[2] : 'btc'
        coinArray[coinArray.length - 1] = split[0]
        percentageCoin = coinData.find((coin) => coin.symbol.toLowerCase() === secondCoin.toLowerCase())
    }
    const uniqueValuesArray = coinArray.filter((value, index, self) => self.indexOf(value === index));
    uniqueValuesArray.forEach((coinName) => {
        coinData.find((responseCoin) => {
            if (responseCoin && responseCoin.symbol && coinName.trim().toLowerCase() === responseCoin.symbol.toLowerCase()) {
                return bot.postMessage(s3.channel, formatSlackPost(responseCoin, percentageCoin, btcPrice), params)
            }
        })
    })
}

export const getFrontPageCC = async () => {
    console.log('Calling front page for CC')
    const response = await request.get(baseUrlCC + frontPageCC).catch(err => new Error(err))
    coinDataCC = formatCoins(JSON.parse(response))
}

export const getFrontPageCMC = async () => {
    console.log('Calling front page for CMC')
    const response = await request.get(baseUrlCMC + frontPageCMC).catch(err => new Error(err))
    const parsedResponse = JSON.parse(response)
    coinDataCMC = formatCoins(Object.values(parsedResponse.data))
}

export const formatCoins = (coinArray) => {
    return coinArray.map((coin) => {
        return {
            symbol: coin.short ? coin.short : coin.symbol,
            price: coin.price ? coin.price : coin.quotes && coin.quotes.USD ? coin.quotes.USD.price : 0,
            perc: coin.perc ? coin.perc : coin.quotes && coin.quotes.USD ? coin.quotes.USD.percent_change_24h : 0
        }
    })
}

export const setFrontPageInterval = () => {
    setInterval(() => {
        getFrontPageCC()
        getFrontPageCMC()
    }, 30000)
}

//Just used to keep app alive on a free Heroku account
export const pingSite = async () => {
    setInterval(async () => {
        const response = await request.get("http://polar-harbor-81506.herokuapp.com").catch(err => new Error(err))
    }, 150000)
}

const formatSlackPost = (coin, percentageCoin, btcPrice) => {
    const symbol = coin.symbol
    const coinImage = emojiList && coin.symbol.toLowerCase() in emojiList ? coin.symbol : 'coincap'
    const coinComparedImage = emojiList && percentageCoin && percentageCoin.symbol.toLowerCase() in emojiList ? percentageCoin.symbol : percentageCoin ? 'coincap' : 'btc'
    const priceFiat = coin.price.toFixed(2)
    const perc = percentageCoin ? parseFloat(coin.perc - percentageCoin.perc).toFixed(2) : parseFloat(coin.perc).toFixed(2)
    const percPrice = percentageCoin ? parseFloat(coin.price / percentageCoin.price).toFixed(precision) : btcPrice ? parseFloat(coin.price / btcPrice).toFixed(precision) : 0
    const chart = getPercentageImage(perc)
    return `${symbol} :${coinImage}: $${priceFiat} :${coinComparedImage}: ${percPrice} ${chart} ${perc}%`
}

export const getEmojiList = async () => {
    console.log('Getting emojis')
    const response = await request.get(`https://slack.com/api/emoji.list?token=${s3.oauthToken}`).catch(err => console.log(new Error(err)))
    emojiList = JSON.parse(response).emoji
}

const getPercentageImage = (perc) => {
    return perc > 40 ? positiveInsane : perc > 30 ? positiveHigh : perc > 20 ? positiveMed : perc > 10 ?
        positiveLow : perc >= 0 ? positiveTiny : perc < -40 ? negativeInsane : perc < -30 ? negativeHigh : perc < -20 ?
            negativeMed : perc < -10 ? negativeLow : negativeTiny
}

export const showHelp = () => {
    bot.postMessage(s3.channel, help, params)
}

export const isMeme = (commands) => {
    const memeString = commands.join(' ')
    const action = commands[0]
    return memes.includes(memeString) ? action : false
}

export const showChart = async (coin, time) => {
    const response = await request.get(baseUrlCC + chartPage + coin.toUpperCase()).catch(err => new Error(err))
    const data = JSON.parse(response)
    const marketCapGraph = data.market_cap
    const priceGraph = data.price
    const chartBuilt = await buildChart(coin, priceGraph, marketCapGraph)
    if(chartBuilt)
        showImage('chart', 'jpg')
}

export const showImage = async (name, ext) => {
    console.log('Showing ', name)
    const options = {
        method: 'POST',
        url: 'https://slack.com/api/files.upload',
        formData: {
            token: s3.botToken,
            channels: s3.channel,
            file: fs.createReadStream(`${__dirname}/images/${name}.${ext}`),
            filename: `${name}.${ext}`,
            filetype: `${ext}`
        }
    }
    return request(options).catch(err => console.error(new Error(err)))
}