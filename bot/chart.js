const fs = require('fs')
const JSDOM = require('jsdom').JSDOM;
const jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'});
const window = jsdom.window;
const anychart = require('anychart')(window);
const anychartExport = require('anychart-nodejs')(anychart);
import {
    chartExtension,
    coinColors
} from '../config/constants'

export const buildAnalysisChart = async (coin, timeData, usdData, baseCoinData, baseCoin) => {
    const chart = anychart.stock()
    console.log('usda', usdData)
    var table = anychart.data.table('x');
    table.addData(usdData);
    var mapping = table.mapAs({'open':"o",'high': "h", 'low':"l", 'close':"c"});
    var series = chart.plot(0).ohlc(mapping);
    var scrollerSeries = chart.scroller().ohlc(table.mapAs({'open':"o",'high': "h", 'low':"l", 'close':"c"}));
    var macd = chart.plot(0).macd(mapping, 12, 26, 9);
    macd.macdSeries().stroke('#bf360c');
    macd.signalSeries().stroke('#ff6d00');
    macd.histogramSeries().fill('#ffe082');
    series.seriesType("candlestick");
    scrollerSeries.seriesType("candlestick");
    // var labels = chart.plot(0).xAxis().labels();
    // labels.enabled(true);
    // chart.title(`${timeData.time} Day Chart For ${coin.toUpperCase()}`)
    // chart.legend(true)
    // const usdSetArray = anychart.data.set(usdData.map((dataItem) => {
    //     return[dataItem[0], dataItem[1]]
    // }))
    // const formattedData = usdSetArray.mapAs({x: 0, value: 1})
    // const yScale1 = anychart.scales.linear()
    // chart.plot(0).yAxis().title("USD Price")
    // chart.plot(0).yAxis().scale(yScale1)
    // const series1 = chart.plot(0).line(formattedData)
    // series1.stroke('#00cc99')
    // series1.yScale(yScale1)
    // series1.name('USD Price')
    //
    // chart.plot(0).xAxis().labels().offsetX(25)
    // chart.plot(0).xAxis().labels().width(100)
    // chart.plot(0).xAxis().labels().format(function (){
    //     let value = this.value
    //     value = timeConverter(value, timeData)
    //     return value
    // })
    // chart.plot(0).yAxis().labels().format(function (){
    //     return '$' + this.value
    // })
    chart.bounds(0, 0, 800, 600)
    chart.container('container')
    chart.draw()
    return await exportChart(chart)
}


export const buildBasicChart = async (coin, timeData, usdData, baseCoinData, baseCoin) => {
    const chart = anychart.line()
    var labels = chart.xAxis().labels();
    labels.enabled(true);
    chart.title(`${timeData.time} Day Chart For ${coin.toUpperCase()}`)
    chart.legend(true)
    const usdSetArray = anychart.data.set(usdData.map((dataItem) => {
        return[dataItem.x, dataItem.c]
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
            return [dataItem.x, dataItem.c]
        }))
        const formattedData2 = baseCoinSetArray.mapAs({x: 0, value: 1})
        const yScale2 = anychart.scales.linear()
        const yAxis2 = chart.yAxis(1)
        yAxis2.orientation("right")
        yAxis2.title(`${baseCoin.toUpperCase()} Price (in ${coin.toUpperCase()})`)
        yAxis2.scale(yScale2)
        const series2 = chart.line(formattedData2)
        series2.stroke(baseCoin.toUpperCase() in coinColors ? coinColors[baseCoin.toUpperCase()] : '#A9A9A9')
        series2.yScale(yScale2)
        series2.name(`${baseCoin.toUpperCase()} Price (in ${coin.toUpperCase()})`)
    }
    chart.xAxis(0).labels().offsetX(25)
    chart.xAxis(0).labels().width(100)
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
    return await exportChart(chart)
}

const exportChart = async (chart) => {
    return new Promise((resolve,reject) => anychartExport.exportTo(chart, chartExtension).then((image) => {
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