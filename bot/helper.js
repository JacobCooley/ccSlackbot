import {
    positiveInsane,
    positiveHigh,
    positiveMed,
    positiveLow,
    positiveTiny,
    negativeInsane,
    negativeHigh,
    negativeMed,
    negativeLow,
    negativeTiny
} from '../config/constants'
import {
    baseUrlCC,
    chartExtension,
    day,
    hour,
    minute,
    help,
    getCoinCC,
    precision, baseUrlChart
} from '../config/app-constants'
import {
    memes
} from "../config/memes";
import bot, {s3} from './bot'
import {
    buildBasicChart,
    buildAnalysisChart
} from './chart'

let emojiList, coinDataCC
const request = require('request-promise')
const fs = require('fs')
const gm = require('gm').subClass({imageMagick: true})
const params = {
    icon_emoji: ':ideas_by_nature:'
}

export const showCoins = async (textData, listenerString, baseCoin) => {
    console.log('Showing coins')
    const baseUrl = baseUrlCC
    const coinUrl = getCoinCC
    let percentageCoin
    const coinArray = textData.trim().split(',')
    if (typeof baseCoin !== 'undefined') {
        try {
            const percentCoin = coinDataCC.find((coin) => coin.symbol.toLowerCase() === baseCoin.toLowerCase())
            if (typeof percentCoin !== 'undefined') {
                const idOrName = percentCoin.name.toLowerCase()
                const response = await request.get(baseUrl + coinUrl + idOrName).catch(err => new Error(err))
                percentageCoin = formatCoins([JSON.parse(response).data])[0]
            }
        }
        catch (e) {
            console.log('Symbol does not exist')
        }
    }
    const uniqueValuesArray = coinArray.filter((value, index, self) => self.indexOf(value === index));
    let coinData = await Promise.all(uniqueValuesArray.map(async (uniqueValue) => {
        try {
            const coin = coinDataCC.find((cmcCoin) => uniqueValue.trim().toLowerCase() === cmcCoin.symbol.toLowerCase())
            if (typeof coin !== 'undefined') {
                const idOrName = coin.name.toLowerCase()
                console.log('uri', baseUrl + coinUrl + idOrName)
                const response = await request.get(baseUrl + coinUrl + idOrName).catch(err => new Error(err))
                return JSON.parse(response).data
            }
        }
        catch (e) {
            console.log('Symbol does not exist')
        }
    }))
    coinData = formatCoins(coinData)
    const btcCoin = coinDataCC.find(coin => (coin.symbol.toLowerCase() === 'btc'))
    const idOrName = btcCoin.name.toLowerCase()
    const btcData = await request.get(baseUrl + coinUrl + idOrName).catch(err => new Error(err))
    const btcPrice = JSON.parse(btcData).data.priceUsd
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
    const response = await request.get(baseUrlCC + getCoinCC).catch(err => new Error(err))
    const parsedResponse = JSON.parse(response)
    coinDataCC = parsedResponse.data
}

export const formatCoins = (coinArray) => {
    return coinArray.map((coin) => {
        return coin ? {
            symbol: coin.symbol,
            price: coin.priceUsd ? parseFloat(coin.priceUsd) : 0,
            perc: coin.changePercent24Hr ? parseFloat(coin.changePercent24Hr) : 0,
            name: coin.name,
            supply: coin.supply ? coin.supply : 0,
            volume: coin.volumeUsd24Hr ? coin.volumeUsd24Hr : 0,
            mktcap: coin.marketCapUsd ? coin.marketCapUsd : 0
        } : {}
    })
}

function compositeImage(coinImage) {
    gm()
        .in('-page', '+0+0')
        .in('./bot/images/do something.jpg')
        .in('-page', '+370+600')
        .in(coinImage)
        .flatten()
        .write('./bot/images/cmon do something.jpg', function (err) {
            if (err) console.log(err)
            else showImage('cmon do something', 'jpg')
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
    if (typeof limit === 'undefined') {
        limit = 10
    }
    if (isNaN(limit)) {
        const limitHolder = limit
        limit = sort
        sort = limitHolder
    }
    const topResponse = await request.get(`${baseUrlCC}${getCoinCC}?limit=${limit}`).catch(err => new Error(err))
    const topData = formatCoins(JSON.parse(topResponse).data)
    let messageString = `Top ${limit} Coins\n`
    topData.forEach((coin, i) => {
        messageString += `#${i + 1} :${coin.symbol}: ${coin.symbol}  |  $${formatNumber(coin.price)}  |  ${formatNumber(coin.perc)}%  |  24hrVol=$${numberWithCommas(formatNumber(coin.volume), 2)}  |  MktCap=$${numberWithCommas(formatNumber(coin.mktcap), 2)} \n`
    })
    bot.postMessage(s3.channel, messageString, params)

}

export const showChart = async (isTA, time, coin, baseCoin) => {
    console.log('Show chart')
    if (isNaN(time)) {
        const timeHolder = time
        time = coin
        coin = timeHolder
    }
    const isBitcoin = coin.toLowerCase() === 'btc'
    const timeData = getTime(time)
    console.log(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=USD&limit=${timeData.limit}`)
    const responseUSD = await request.get(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=USD&limit=${timeData.limit}`).catch(err => new Error(err))
    const dataUSD = JSON.parse(responseUSD)
    if (dataUSD.Data.length !== 0) {
        const usdGraph = dataUSD.Data.map((data) => {
            return {
                x: data.time * 1000,
                c: data.close,
                o: data.open,
                h: data.high,
                l: data.low
        }
        })
        let baseGraph
        if (!isBitcoin && typeof baseCoin === 'undefined') {
            baseCoin = 'BTC'
        }
        if (typeof baseCoin !== 'undefined') {
            console.log(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=${baseCoin.toUpperCase()}&limit=${timeData.limit}`)
            const responseBase = await request.get(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=${baseCoin.toUpperCase()}&limit=${timeData.limit}`).catch(err => new Error(err))
            const dataBase = JSON.parse(responseBase)
            if (dataBase.Data.length !== 0) {
                baseGraph = dataBase.Data.map((data) => {
                    return {
                        x: data.time * 1000,
                        c: data.close,
                        o: data.open,
                        h: data.high,
                        l: data.low
                    }
                })
            }
        }
        const chartBuilt = isTA ? await buildAnalysisChart(coin, timeData, usdGraph, baseGraph, baseCoin) : await buildBasicChart(coin, timeData, usdGraph, baseGraph, baseCoin)
        if (chartBuilt) showImage('chart', chartExtension)
    }
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

const numberWithCommas = (num, digits) => {
    const si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "B" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

export const doSomething = (image) => {
    gm(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`).resize(150, 150)
        .write(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`, (err) => {
            if (err) console.log(err)
            else compositeImage(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`)
        })
}