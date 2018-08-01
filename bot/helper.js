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
    people,
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
    precision, baseUrlChart
} from '../config/constants'
import bot, {s3} from './bot'
import {buildChart} from './chart'
const request = require('request-promise')
const fs = require('fs')
const gm = require('gm').subClass({imageMagick: true})
const params = {
    icon_emoji: ':ideas_by_nature:'
}
let emojiList, coinDataCC, coinDataCMC

export const showCoins = (textData, listenerString) => {
    if (listenerString === 'cc')
        showCoinsCC(textData)
    else
        showCoinsCMC(textData)

}

const showCoinsCMC = async (textData) => {
    console.log('Showing coins from coinmarketcap')
    let percentageCoin
    const coinArray = textData.trim().split(',')
    const split = coinArray[coinArray.length - 1].trim().split(' ')
    if (split[1] === 'in') {
        try {
            const secondCoin = split[2] ? split[2] : 'btc'
            coinArray[coinArray.length - 1] = split[0]
            const percentPos = coinDataCMC.find((coin) => coin.symbol.toLowerCase() === secondCoin.toLowerCase()).id
            const response = await request.get(baseUrlCMC + getCoinCMC + percentPos).catch(err => new Error(err))
            percentageCoin = formatCoins([JSON.parse(response).data])[0]
        }
        catch (e) {
            console.log('Symbol does not exist')
        }
    }
    const uniqueValuesArray = coinArray.filter((value, index, self) => self.indexOf(value === index));
    let coinData = await Promise.all(uniqueValuesArray.map(async (uniqueValue) => {
        try {
            const coinPos = coinDataCMC.find((cmcCoin) => uniqueValue.trim().toLowerCase() === cmcCoin.symbol.toLowerCase()).id
            const response = await request.get(baseUrlCMC + getCoinCMC + coinPos).catch(err => new Error(err))
            return JSON.parse(response).data
        }
        catch (e) {
            console.log('Symbol does not exist')
        }
    }))
    coinData = formatCoins(coinData)
    const btcPos = coinDataCMC.find(coin => (coin.symbol.toLowerCase() === 'btc')).id
    const btcData = await request.get(baseUrlCMC + 'ticker/' + btcPos).catch(err => new Error(err))
    const btcPrice = JSON.parse(btcData).data.quotes.USD.price
    uniqueValuesArray.forEach((coinName) => {
        coinData.find((responseCoin) => {
            if (responseCoin && responseCoin.symbol && coinName.trim().toLowerCase() === responseCoin.symbol.toLowerCase()) {
                return bot.postMessage(s3.channel, formatSlackPost(responseCoin, percentageCoin, btcPrice), params)
            }
        })
    })
}

const showCoinsCC = async (textData) => {
    console.log('Showing coins from coincap')
    let percentageCoin
    const coinArray = textData.trim().split(',')
    const split = coinArray[coinArray.length - 1].trim().split(' ')
    const btcPrice = coinDataCC.find(coin => (coin.symbol.toLowerCase() === 'btc')).price
    if (split[1] === 'in') {
        const secondCoin = split[2] ? split[2] : 'btc'
        coinArray[coinArray.length - 1] = split[0]
        percentageCoin = coinDataCC.find((coin) => coin.symbol.toLowerCase() === secondCoin.toLowerCase())
    }
    const uniqueValuesArray = coinArray.filter((value, index, self) => self.indexOf(value === index));
    uniqueValuesArray.forEach((coinName) => {
        coinDataCC.find((responseCoin) => {
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
    coinDataCMC = parsedResponse.data
}

export const formatCoins = (coinArray) => {
    return coinArray.map((coin) => {
            return coin ? {
                symbol: coin.short ? coin.short : coin.symbol,
                price: coin.price ? coin.price : coin.quotes && coin.quotes.USD ? coin.quotes.USD.price : 0,
                perc: coin.perc ? coin.perc : coin.quotes && coin.quotes.USD ? coin.quotes.USD.percent_change_24h : 0,
                name: coin.name ? coin.name : coin.long
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
    getFrontPageCC()
    getFrontPageCMC()
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
    const coinComparedImage = emojiList && percentageCoin && percentageCoin.symbol && percentageCoin.symbol.toLowerCase() in emojiList ? percentageCoin.symbol : percentageCoin ? 'coincap' : 'btc'
    const priceFiat = coin.price.toFixed(2)
    const perc = percentageCoin ? parseFloat(coin.perc - percentageCoin.perc).toFixed(2) : parseFloat(coin.perc).toFixed(2)
    const percPrice = percentageCoin ? parseFloat(coin.price / percentageCoin.price).toFixed(precision) : btcPrice ? parseFloat(coin.price / btcPrice).toFixed(precision) : 0
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

export const showChart = async (coin, time) => {
    console.log('time', time)
    const isBitcoin = coin.toLowerCase() === 'btc'
    const timeData = getTime(time)
    console.log('data', timeData)
    const responseUSD = await request.get(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=USD&limit=${timeData.limit}`).catch(err => new Error(err))
    const dataUSD = JSON.parse(responseUSD)
    const usdGraph = dataUSD.Data.map((data) => {
        return [
            data.time * 1000,
            data.high
        ]
    })
    let btcGraph
    if(!isBitcoin) {
        const responseBTC = await request.get(`${baseUrlChart}${timeData.day}?fsym=${coin.toUpperCase()}&tsym=BTC&limit=${timeData.limit}`).catch(err => new Error(err))
        const dataBTC = JSON.parse(responseBTC)
        btcGraph = dataBTC.Data.map((data) => {
            return [
                data.time * 1000,
                data.high
            ]
        })
    }
    const chartBuilt = await buildChart(coin, timeData, usdGraph, btcGraph)
    if (chartBuilt)
        showImage('chart', 'jpg')
}

export const showImage = async (name, ext, channel) => {
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
    console.log(people.includes(image))
    if (people.includes(image)) {
        compositeImage('./bot/images/' + image + '.jpeg', channel)
    } else {
        gm(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`).resize(150, 150)
            .write(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`, (err) => {
                if (err) console.log(err)
                else compositeImage(`./node_modules/cryptocurrency-icons/dist/128/color/${image}.png`, channel)
            })
    }
}