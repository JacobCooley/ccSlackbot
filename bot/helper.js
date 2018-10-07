import {
    baseUrlCC,
    baseUrlCMC,
    frontPageCMC,
    memes,
    chartTimeFrame,
    day,
    hour,
    minute,
    getCoinCMC,
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
    getCoinCC,
    precision, baseUrlChart
} from '../config/constants'
import bot, {s3} from './bot'
import {buildChart} from './chart'
let emojiList, coinDataCC, coinDataCMC
const request = require('request-promise')
const fs = require('fs')
const gm = require('gm').subClass({imageMagick: true})
const params = {
    icon_emoji: ':ideas_by_nature:'
}

export const showCoins = async (textData, listenerString, baseCoin) => {
    console.log('Showing coins')
    const baseUrl = listenerString === 'cc' ? baseUrlCC : baseUrlCMC
    const coinUrl = listenerString === 'cc' ? getCoinCC : getCoinCMC
    let percentageCoin
    const coinArray = textData.trim().split(',')
    if (typeof baseCoin !== 'undefined') {
        try {
            const percentCoin = coinDataCMC.find((coin) => coin.symbol.toLowerCase() === baseCoin.toLowerCase())
            const idOrName = listenerString === 'cc' ? percentCoin.name.toLowerCase() : percentCoin.id
            const response = await request.get(baseUrl + coinUrl + idOrName).catch(err => new Error(err))
            percentageCoin = formatCoins([JSON.parse(response).data])[0]
        }
        catch (e) {
            console.log('Symbol does not exist')
        }
    }
    const uniqueValuesArray = coinArray.filter((value, index, self) => self.indexOf(value === index));
    let coinData = await Promise.all(uniqueValuesArray.map(async (uniqueValue) => {
        try {
            const coin = coinDataCMC.find((cmcCoin) => uniqueValue.trim().toLowerCase() === cmcCoin.symbol.toLowerCase())
            const idOrName = listenerString === 'cc' ? coin.name.toLowerCase() : coin.id
            console.log('uri', baseUrl + coinUrl + idOrName)
            const response = await request.get(baseUrl + coinUrl + idOrName).catch(err => new Error(err))
            return JSON.parse(response).data
        }
        catch (e) {
            console.log('Symbol does not exist')
        }
    }))
    coinData = formatCoins(coinData)
    const btcCoin = coinDataCMC.find(coin => (coin.symbol.toLowerCase() === 'btc'))
    const idOrName = listenerString === 'cc' ? btcCoin.name.toLowerCase() : btcCoin.id
    const btcData = await request.get(baseUrl + coinUrl + idOrName).catch(err => new Error(err))
    const btcPrice = listenerString === 'cc' ? JSON.parse(btcData).data.priceUsd : JSON.parse(btcData).data.quotes.USD.price
    uniqueValuesArray.forEach((coinName) => {
        coinData.find((responseCoin) => {
            if (responseCoin && responseCoin.symbol && coinName.trim().toLowerCase() === responseCoin.symbol.toLowerCase()) {
                return bot.postMessage(s3.channel, formatSlackPost(responseCoin, percentageCoin, btcPrice), params)
            }
        })
    })
}

export const getFrontPage = async () => {
    console.log('Calling front page')
    const response = await request.get(baseUrlCMC + frontPageCMC).catch(err => new Error(err))
    const parsedResponse = JSON.parse(response)
    coinDataCMC = parsedResponse.data
}

export const formatCoins = (coinArray) => {
    return coinArray.map((coin) => {
        return coin ? {
            symbol: coin.symbol,
            price: coin.priceUsd ? parseFloat(coin.priceUsd) : coin.quotes && coin.quotes.USD ? coin.quotes.USD.price : 0,
            perc: coin.changePercent24Hr ? parseFloat(coin.changePercent24Hr) : coin.quotes && coin.quotes.USD ? coin.quotes.USD.percent_change_24h : 0,
            name: coin.name,
            supply: coin.supply ? coin.supply : 0,
            volume: coin.volumeUsd24Hr ? coin.volumeUsd24Hr : 0
        } : {}
    })
}

function compositeImage(coinImage, channel) {
    gm()
        .in('-page', '+0+0')
        .in('./bot/images/do something.jpg')
        .in('-page', '+380+600')
        .in(coinImage)
        .flatten()
        .write('./bot/images/cmon do something.jpg', function (err) {
            if (err) console.log(err)
            else showImage('cmon do something', 'jpg', channel)
        });
}

export const setFrontPageInterval = () => {
    getMarketData()
    setInterval(() => {
        getMarketData()
    }, 30000)
}

const getMarketData = () => {
    try {
        getFrontPage()
    }
    catch (e) {
        console.log(e)
    }
}

const formatNumber = (number, precision) => {
    return parseFloat(number).toFixed(typeof precision !== 'undefined' ? precision : 2)
}

const formatSlackPost = (coin, percentageCoin, btcPrice) => {
    console.log('Formatting slackpost')
    const symbol = coin.symbol
    const coinImage = emojiList && coin.symbol.toLowerCase() in emojiList ? coin.symbol : 'coincap'
    const coinComparedImage = emojiList && percentageCoin && percentageCoin.symbol && percentageCoin.symbol.toLowerCase() in emojiList ? percentageCoin.symbol : percentageCoin ? 'coincap' : 'btc'
    const priceFiat = coin.price.toFixed(2)
    const perc = percentageCoin ? formatNumber(coin.perc - percentageCoin.perc) : formatNumber(coin.perc)
    const percPrice = percentageCoin ? formatNumber(coin.price / percentageCoin.price, precision) : btcPrice ? formatNumber(coin.price / btcPrice, precision) : 0
    const flavorImage = getPercentageImage(perc)
    return `${symbol} :${coinImage}: $${priceFiat} :${coinComparedImage}: ${percPrice} ${flavorImage} ${perc}%`
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

const getTime = (time) => {
    switch (time) {
        case '1':
            return {
                time: 1,
                day: minute,
                limit: 24 * 60
            }
        case '7':
            return {
                time: 7,
                day: hour,
                limit: 7 * 24
            }
        case '30':
            return {
                time: 30,
                day: hour,
                limit: 30 * 24
            }
        case '90':
            return {
                time: 90,
                day: hour,
                limit: 90 * 24
            }
        case '180':
            return {
                time: 180,
                day: day,
                limit: 180
            }
        case '365':
        default:
            return {
                time: 365,
                day: day,
                limit: 365
            }
    }
}

export const displayTop = async (limit, sort) => {
    console.log('Display top ' + limit, sort)
    if(typeof limit === 'undefined'){
        limit = 10
    }
    if(isNaN(limit)){
        const limitHolder = limit
        limit = sort
        sort = limitHolder
    }
    const topResponse = await request.get(`${baseUrlCC}${getCoinCC}?limit=${limit}`).catch(err => new Error(err))
    const topData = formatCoins(JSON.parse(topResponse).data)
    let messageString = `Top ${limit} Coins\n`
    topData.forEach((coin, i) => {
        messageString += `#${i+1} :${coin.symbol}: ${coin.name} $${formatNumber(coin.price)} ${formatNumber(coin.perc)}% 24Hr Volume=${formatNumber(coin.volume)} \n`
    })
    bot.postMessage(s3.channel, messageString, params)

}

export const showChart = async (coin, time, baseCoin) => {
    console.log('Show chart', coin)
    const isBitcoin = coin.toLowerCase() === 'btc'
    const timeData = getTime(time)
    console.log(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=USD&limit=${timeData.limit}`)
    const responseUSD = await request.get(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=USD&limit=${timeData.limit}`).catch(err => new Error(err))
    const dataUSD = JSON.parse(responseUSD)
    const usdGraph = dataUSD.Data.map((data) => {
        return [
            data.time * 1000,
            data.high
        ]
    })
    let btcGraph
    if (!isBitcoin || typeof baseCoin !== 'undefined') {
        console.log(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=${typeof baseCoin !== 'undefined' ? baseCoin.toUpperCase() : "BTC"}&limit=${timeData.limit}`)
        const responseBTC = await request.get(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=${typeof baseCoin !== 'undefined' ? baseCoin.toUpperCase() : "BTC"}&limit=${timeData.limit}`).catch(err => new Error(err))
        const dataBTC = JSON.parse(responseBTC)
        btcGraph = dataBTC.Data.map((data) => {
            return [
                data.time * 1000,
                data.high
            ]
        })
    }
    const chartBuilt = await buildChart(coin, timeData, usdGraph, btcGraph)
    if (chartBuilt) showImage('chart', 'pdf')
}

export const showImage = (name, ext, channel) => {
    console.log('Showing ', name)
    const options = {
        method: 'POST',
        url: 'https://slack.com/api/files.upload',
        formData: {
            token: s3.botToken,
            channels: channel ? channel : s3.channel,
            file: fs.createReadStream(`./bot/images/${name}.${ext}`),
            filename: `${name}.${ext}`,
            filetype: `${ext}`
        }
    }
    return request(options).catch(err => console.error(new Error(err)))
}

export const doSomething = (image, channel) => {
    gm(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`).resize(150, 150)
        .write(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`, (err) => {
            if (err) console.log(err)
            else compositeImage(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`, channel)
        })
}