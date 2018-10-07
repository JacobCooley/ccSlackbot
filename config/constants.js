export const botName = 'Coins By Nature'
export const chartExtension = 'png'
export const memes = [
    ''
]
export const startListening = [
    'cc',
    'cmc'
]
export const coinColors = {
    "BTC": '#FF9900',
    "ETH": '#3c3c3d',
    "XRP": '#006097',
    "BCH": '#ee8c28',
    "ADA": '#333333',
    "LTC": '#d3d3d3',
    "XLM": '#04b5e5',
    "SALT": '#00B2B2',
    "XMR": '#ff6600',
    "DOGE": '#e1b303'
}
export const baseUrlCC = 'https://api.coincap.io/v2/'
export const baseUrlCMC = 'https://api.coinmarketcap.com/v2/'
export const baseUrlChart = 'https://min-api.cryptocompare.com/data/'
export const day = 'histoday'
export const hour = 'histohour'
export const minute = 'histominute'
export const frontPageCMC = 'listings/'
export const getCoinCMC = 'ticker/'
export const getCoinCC = 'assets/'
export const positiveMoon = ':amaze:'
export const positiveInsane = ':amaze:'
export const positiveHigh = ':awyeah:'
export const positiveMed = ':what-face:'
export const positiveLow = ':bam:'
export const positiveTiny = ':uptrend:'
export const negativeInsane = ':shitstorm:'
export const negativeMoon = ':this_is_fine_gif:'
export const negativeHigh = ':this_is_fine_gif:'
export const negativeMed = ':headwall:'
export const negativeLow = ':seriously:'
export const negativeTiny = ':downtrend:'
export const precision = 8
export const help =
    `   *Coinbot's help section*
    ------------------------------------------------------------
    cc -- gets prices from CoinCap
    cmc -- gets prices from CoinMarketCap
    
    cc [symbol] -- [symbol]'s price in USD and amount relative to BTC
        _e.g._  \`cc btc\` \`cmc btc\`
    
    cc [symbol1] in [symbol2] -- [symbol1]'s price in USD and amount relative to [symbol2]
        _e.g._  \`cc btc in eth\` \`cmc btc in eth\`
    
    cc [symbol1], [symbol2], [symbol...] -- Send in an array to get multiple values at once
        _e.g._  \`cmc btc, eth, ada\`  \`cc btc, eth, ada in eth\`
   
    cc chart [symbol] [time] -- Chart for [symbol] including price compared with USD and BTC.
        *[time] values can be 1, 7, 30, 90, 180, and 365.  It defaults to 365*
        
    cc top [limit] [sort] -- Displays top coins the the amount of [limit] in the order of [sort]
        *[limit] will default to 10
        *[sort] values can be ... .  It defaults to priceByMarketCap
            `