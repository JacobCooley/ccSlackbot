export const botName = 'Coins By Nature'
export const memes = [
    'sean'
]
export const people = [
    'chris',
    'cj',
    'phil',
    'jeff',
    'justin',
    'sean',
    'jake',
    'patrick',
    'david',
    'dylan',
    'stu',
    'steven'
]
export const startListening = [
    'cc',
    'cmc'
]
export const baseUrlCC = 'http://coincap.io/'
export const baseUrlCMC = 'https://api.coinmarketcap.com/v2/'
export const baseUrlChart = 'https://min-api.cryptocompare.com/data/'
export const day = 'histoday'
export const hour = 'histohour'
export const minute = 'histominute'
export const frontPageCC = 'front/'
export const frontPageCMC = 'listings/'
export const getCoinCMC = 'ticker/'
export const coinPage = 'page/'
export const chartPage = 'history/'
export const positiveInsane = ':amaze:'
export const positiveHigh = ':awyeah:'
export const positiveMed = ':what-face:'
export const positiveLow = ':bam:'
export const positiveTiny = ':uptrend:'
export const negativeInsane = ':shitstorm:'
export const negativeHigh = ':this_is_fine_gif:'
export const negativeMed = ':headwall:'
export const negativeLow = ':seriously:'
export const negativeTiny = ':downtrend:'
export const precision = 8
export const help =
    `   *Coinbot's help section*
    
    cc gets prices from CoinCap
    cmc gets prices from CoinMarketCap
    
    cc [symbol] - [symbol]'s price in USD and amount relative to BTC
    _e.g._  \`cc btc\` \`cmc btc\`
    
    cc [symbol1] in [symbol2] - [symbol1]'s price in USD and amount relative to [symbol2]
    _e.g._  \`cc btc in eth\` \`cmc btc in eth\`
    
    cc [symbol1], [symbol2], [symbol...] Send in an array to get multiple values at once
    _e.g._  \`cmc btc, eth, ada\`  \`cc btc, eth, ada in eth\`
   
    [time] values for charts can be 1, 7, 30, 90, 180, and 365.  It defaults to 365
    cc chart [symbol] [time]  - Chart for [symbol] including price compared with USD and BTC.
    `
export const chartTimeFrame = {
    1: '1day/',
    7: '7day/',
    30: '30day/',
    90: '90day/',
    180: '180day/',
    365: '365day/'
}