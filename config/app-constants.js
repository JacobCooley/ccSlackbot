export const chartExtension = 'jpg'
export const startListening = [
    'cc'
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
export const baseUrlChart = 'https://min-api.cryptocompare.com/data/'
export const day = 'histoday'
export const hour = 'histohour'
export const minute = 'histominute'
export const getCoinCC = 'assets/'
export const precision = 8
export const help =
    `   *Coinbot's help section*

    cc -- gets prices from CoinCap
    cmc -- gets prices from CoinMarketCap
    
    cc [symbol] -- [symbol]'s price in USD and amount relative to BTC
        _e.g._  \`cc btc\`
    
    cc [symbol1] in [symbol2] -- [symbol1]'s price in USD and amount relative to [symbol2]
        _e.g._  \`cc btc in eth\`
    
    cc [symbol1], [symbol2], [symbol...] -- Send in an array to get multiple values at once
        _e.g._  \`cc btc, eth, ada\`
   
    cc chart [time] [symbol1] in [symbol2] -- Chart for [symbol1] including price compared with USD and [symbol2].
        _e.g._  \`cc chart btc in eth\`
        *[time] values can be 1, 7, 30, 90, 180, and 365.  It defaults to 365*
        *[symbol2] defaults to BTC if not specified*
        
    cc top [limit] [sort] -- Displays top coins the the amount of [limit] in the order of [sort]
        _e.g._  \`cc top 20\`
        *[limit] will default to 10*
        *[sort] values can be ... .  It defaults to priceByMarketCap*
        *sort isn't implemented yet*
            `