export const botName = 'Coins By Nature'
// export const channel = 'chatbot_test'
export const channel = 'trading_fomo_ta'
export const startListening = 'cc'
export const baseUrl = 'http://coincap.io/'
export const frontPage = 'front/'
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
    
    cc [symbol] - [symbol]'s price in USD and amount relative to BTC
    _e.g._  \`cc btc\`
    
    cc [symbol1] in [symbol2] - [symbol1]'s price in USD and amount relative to [symbol2]
    _e.g._  \`cc btc in eth\`
    
    cc [symbol1], [symbol2], [symbol...] Send in an array to get multiple values at once
    _e.g._  \`cc btc, eth, ada\`  \`cc btc, eth, ada in eth\`
   
   *BETA*
       
    cc chart [symbol] - Chart for [symbol] including price and market cap.
    `
export const chartTimeFrame = {
    1: '1day/',
    7: '7day/',
    30: '30day/',
    90: '90day/',
    180: '180day/',
    365: '365day/'
}