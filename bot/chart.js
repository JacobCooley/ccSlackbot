const fs = require('fs')
const JSDOM = require('jsdom').JSDOM
const jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'})
const window = jsdom.window
const anychart = require('anychart')(window)
const anychartExport = require('anychart-nodejs')(anychart)

export const buildChart = async (coin, data, data2) => {
    const combinedArray = anychart.data.set(data.map((dataItem) => {
        const data2Item = data2.find((data2Item) => data2Item[0] === dataItem[0])
        return[timeConverter(dataItem[0]), dataItem[1], data2Item[1]]
    }))
    const formattedData = combinedArray.mapAs({x: 0, value: 1})
    const formattedData2 = combinedArray.mapAs({x: 0, value: 2})

    const chart = anychart.line()
    chart.title(`Crypto Chart For ${coin.toUpperCase()}`)
    chart.legend(true);

    const yScale1 = anychart.scales.linear();
    chart.yAxis(0).title("Price");
    chart.yAxis(0).scale(yScale1)
    const series1 = chart.line(formattedData)
    series1.normal().stroke('#00cc99')
    series1.yScale(yScale1)
    series1.name('Price')

    const yScale2 = anychart.scales.linear();
    const yAxis2 = chart.yAxis(1);
    yAxis2.orientation("right");
    yAxis2.title("Market Cap");
    yAxis2.scale(yScale2)
    const series2 = chart.line(formattedData2)
    series2.normal().stroke('#0066cc')
    series2.yScale(yScale2)
    series2.name('Market Cap')

    chart.bounds(0, 0, 800, 600)
    chart.container('container')
    chart.draw()

    return await new Promise((resolve,reject) => anychartExport.exportTo(chart, 'jpg').then((image) => {
        fs.writeFile(`${__dirname}/images/chart.jpg`, image, (fsWriteError) => {
            console.log('write',fsWriteError)
            if (fsWriteError) {
                reject(fsWriteError)
            } else {
                resolve(true)
            }
        })
    }))
}

const timeConverter = (UNIX_timestamp) => {
    const a = new Date(UNIX_timestamp)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const year = a.getFullYear()
    const month = months[a.getMonth()]
    const date = a.getDate()
    const hour = a.getHours()
    const min = a.getMinutes()
    const sec = a.getSeconds()
    const time = month
    return time
}