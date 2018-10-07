const fs = require('fs')
var JSDOM = require('jsdom').JSDOM;
var jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'});
var window = jsdom.window;
var anychart = require('anychart')(window);
var anychartExport = require('anychart-nodejs')(anychart);
import {
    chartExtension
} from '../config/constants'

export const buildChart = async (coin, timeData, usdData, baseCoinData, baseCoin) => {
    const chart = anychart.line()
    chart.title(`${timeData.time} Day Chart For ${coin.toUpperCase()}`)
    chart.legend(true)
    const usdSetArray = anychart.data.set(usdData.map((dataItem) => {
        return[dataItem[0], dataItem[1]]
    }))
    const formattedData = usdSetArray.mapAs({x: 0, value: 1})
    const yScale1 = anychart.scales.linear()
    chart.yAxis(0).title("USD Price")
    chart.yAxis(0).scale(yScale1)
    const series1 = chart.line(formattedData)
    series1.stroke('#00cc99')
    series1.yScale(yScale1)
    series1.name('USD Price')
    if(baseCoinData) {
        const baseCoinSetArray = anychart.data.set(baseCoinData.map((dataItem) => {
            return [dataItem[0], dataItem[1]]
        }))
        const formattedData2 = baseCoinSetArray.mapAs({x: 0, value: 1})
        const yScale2 = anychart.scales.linear()
        const yAxis2 = chart.yAxis(1)
        yAxis2.orientation("right")
        yAxis2.title(`${baseCoin} Price`)
        yAxis2.scale(yScale2)
        const series2 = chart.line(formattedData2)
        series2.stroke('#FF9900')
        series2.yScale(yScale2)
        series2.name(`${baseCoin} Price`)
    }
    chart.xAxis(0).labels().offsetX(-5)
    chart.xAxis(0).labels().format(function (){
        let value = this.value
        value = timeConverter(value, timeData)
        return value
    })
    chart.yAxis(0).labels().format(function (){
        return '$' + this.value
    })
    chart.bounds(0, 0, 800, 600)
    chart.container('container')
    chart.draw()

    return await new Promise((resolve,reject) => anychartExport.exportTo(chart, chartExtension).then((image) => {
        fs.writeFile(`./bot/images/chart.${chartExtension}`, image, (fsWriteError) => {
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