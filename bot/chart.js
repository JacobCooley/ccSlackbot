const fs = require('fs')
const JSDOM = require('jsdom').JSDOM
const jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'})
const window = jsdom.window
const anychart = require('anychart')(window)
const anychartExport = require('anychart-nodejs')(anychart)

export const buildChart = async (coin, timeData, usdData, btcData) => {
    const chart = anychart.line()
    chart.title(`${timeData.time} Day Chart For ${coin.toUpperCase()}`)
    chart.legend(true)

    const usdSetArray = anychart.data.set(usdData.map((dataItem) => {
        return[dataItem[0], dataItem[1]]
    }))
    const formattedData = usdSetArray.mapAs({x: 0, value: 1})
    const yScale1 = anychart.scales.linear();
    chart.yAxis(0).title("USD Price");
    chart.yAxis(0).scale(yScale1)
    const series1 = chart.line(formattedData)
    series1.normal().stroke('#00cc99')
    series1.yScale(yScale1)
    series1.name('USD Price')

    if(btcData) {
        const btcSetArray = anychart.data.set(btcData.map((dataItem) => {
            return [dataItem[0], dataItem[1]]
        }))
        const formattedData2 = btcSetArray.mapAs({x: 0, value: 1})
        const yScale2 = anychart.scales.linear();
        const yAxis2 = chart.yAxis(1);
        yAxis2.orientation("right");
        yAxis2.title("BTC Price");
        yAxis2.scale(yScale2)
        const series2 = chart.line(formattedData2)
        series2.normal().stroke('#FF9900')
        series2.yScale(yScale2)
        series2.name('BTC Price')
    }
    chart.xAxis(0).labels().offsetX(-5)
    chart.xAxis(0).labels().format(function (){
        let value = this.value;
        value = timeConverter(value, timeData)
        return value;
    })
    chart.bounds(0, 0, 800, 600)
    chart.container('container')
    chart.draw()

    return await new Promise((resolve,reject) => anychartExport.exportTo(chart, 'jpg').then((image) => {
        fs.writeFile(`./bot/images/chart.jpg`, image, (fsWriteError) => {
            if (fsWriteError) {
                reject(fsWriteError)
            } else {
                resolve(true)
            }
        })
    }))
}

const timeConverter = (UNIX_timestamp, timeData) => {
    const a = new Date(UNIX_timestamp)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const year = a.getFullYear()
    const month = months[a.getMonth()]
    const date = a.getDate()
    const hour = a.getHours()
    const min = a.getMinutes()
    const sec = a.getSeconds()
    switch (timeData.time) {
        case 1:
            return `${hour}:00`
        case 7:
            return `${date}. ${month}`
        case 30:
            return `${date}. ${month}`
        case 90:
            return `${date}. ${month}`
        case 180:
            return `${date}. ${month}`
        case 365:
            return `${month} '${year.toString().substr(2)}`
    }
    const time = month
    return time
}