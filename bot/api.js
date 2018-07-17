const axios = require('axios')

export async function getCall(url) {
    try {
        return await axios.get(url)
    } catch (error) {
        console.log('ERROR', error)
    }
}

// export async function getChart(bot, url) {
//     try {
//         console.log('url', url)
//         const response = await axios.get(url)
//         const data = response.data
//         console.log('data', data)
//     } catch (error) {
//         console.log('ERROR', error)
//     }
//     bot.postMessage(Constants.channel, 'Heck yeah')
// }