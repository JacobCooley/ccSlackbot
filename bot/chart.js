const fs = require('fs')
var JSDOM = require('jsdom').JSDOM;
var jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'});
var window = jsdom.window;
const anychart = require('anychart')(window)
const anychartExport = require('anychart-nodejs')(anychart)

export const buildChart = async (coin, timeData, usdData, btcData) => {
    // const chart = anychart.line()
    // chart.title(`${timeData.time} Day Chart For ${coin.toUpperCase()}`)
    // chart.legend(true)
    // const usdSetArray = anychart.data.set(usdData.map((dataItem) => {
    //     return[dataItem[0], dataItem[1]]
    // }))
    // const formattedData = usdSetArray.mapAs({x: 0, value: 1})
    // const yScale1 = anychart.scales.linear()
    // chart.yAxis(0).title("USD Price")
    // chart.yAxis(0).scale(yScale1)
    // const series1 = chart.line(formattedData)
    // series1.normal().stroke('#00cc99')
    // series1.yScale(yScale1)
    // series1.name('USD Price')
    // // if(btcData) {
    // //     const btcSetArray = anychart.data.set(btcData.map((dataItem) => {
    // //         return [dataItem[0], dataItem[1]]
    // //     }))
    // //     const formattedData2 = btcSetArray.mapAs({x: 0, value: 1})
    // //     const yScale2 = anychart.scales.linear()
    // //     const yAxis2 = chart.yAxis(1)
    // //     yAxis2.orientation("right")
    // //     yAxis2.title("BTC Price")
    // //     yAxis2.scale(yScale2)
    // //     const series2 = chart.line(formattedData2)
    // //     series2.normal().stroke('#FF9900')
    // //     series2.yScale(yScale2)
    // //     series2.name('BTC Price')
    // // }
    // chart.xAxis(0).labels().offsetX(-5)
    // chart.xAxis(0).labels().format(function (){
    //     let value = this.value
    //     value = timeConverter(value, timeData)
    //     return value
    // })
    // chart.yAxis(0).labels().format(function (){
    //     return '$' + this.value
    // })
    // chart.bounds(0, 0, 800, 600)
    // chart.container('container')
    // chart.draw()




    var dataSet = anychart.data.set([
        ['1986', 3.6, 2.3, 2.8, 11.5],
        ['1987', 7.1, 4.0, 4.1, 14.1],
        ['1988', 8.5, 6.2, 5.1, 17.5],
        ['1989', 9.2, 11.8, 6.5, 18.9],
        ['1990', 10.1, 13.0, 12.5, 20.8],
        ['1991', 11.6, 13.9, 18.0, 22.9],
        ['1992', 16.4, 18.0, 21.0, 25.2],
        ['1993', 18.0, 23.3, 20.3, 27.0],
        ['1994', 13.2, 24.7, 19.2, 26.5],
        ['1995', 12.0, 18.0, 14.4, 25.3],
        ['1996', 3.2, 15.1, 9.2, 23.4],
        ['1997', 4.1, 11.3, 5.9, 19.5],
        ['1998', 6.3, 14.2, 5.2, 17.8],
        ['1999', 9.4, 13.7, 4.7, 16.2],
        ['2000', 11.5, 9.9, 4.2, 15.4],
        ['2001', 13.5, 12.1, 1.2, 14.0],
        ['2002', 14.8, 13.5, 5.4, 12.5],
        ['2003', 16.6, 15.1, 6.3, 10.8],
        ['2004', 18.1, 17.9, 8.9, 8.9],
        ['2005', 17.0, 18.9, 10.1, 8.0],
        ['2006', 16.6, 20.3, 11.5, 6.2],
        ['2007', 14.1, 20.7, 12.2, 5.1],
        ['2008', 15.7, 21.6, 10, 3.7],
        ['2009', 12.0, 22.5, 8.9, 1.5]
    ]);

    // map data for the first series, take x from the zero column and value from the first column of data set
    var seriesData_1 = dataSet.mapAs({
        'x': 0,
        'value': 1
    });

    // map data for the second series, take x from the zero column and value from the second column of data set
    var seriesData_2 = dataSet.mapAs({
        'x': 0,
        'value': 2
    });

    // map data for the third series, take x from the zero column and value from the third column of data set
    var seriesData_3 = dataSet.mapAs({
        'x': 0,
        'value': 3
    });

    // create line chart
    var chart = anychart.line();

    // turn on chart animation
    chart.animation(true);

    // set chart padding
    chart.padding([10, 20, 5, 20]);

    // turn on the crosshair
    chart.crosshair()
        .enabled(true)
        .yLabel(false)
        .yStroke(null);

    // set tooltip mode to point
    chart.tooltip().positionMode('point');

    // set chart title text settings
    chart.title('Trend of Sales of the Most Popular Products of ACME Corp.');

    // set yAxis title
    chart.yAxis().title('Number of Bottles Sold (thousands)');
    chart.xAxis().labels().padding(5);

    // create first series with mapped data
    var series_1 = chart.line(seriesData_1);
    series_1.name('Brandy');
    series_1.hovered().markers()
        .enabled(true)
        .type('circle')
        .size(4);
    series_1.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);

    // create second series with mapped data
    var series_2 = chart.line(seriesData_2);
    series_2.name('Whiskey');
    series_2.hovered().markers()
        .enabled(true)
        .type('circle')
        .size(4);
    series_2.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);

    // create third series with mapped data
    var series_3 = chart.line(seriesData_3);
    series_3.name('Tequila');
    series_3.hovered().markers()
        .enabled(true)
        .type('circle')
        .size(4);
    series_3.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);

    // turn the legend on
    chart.legend()
        .enabled(true)
        .fontSize(13)
        .padding([0, 0, 10, 0]);

    // set container id for the chart
    chart.container('container');
    // initiate chart drawing
    chart.draw();


    return await new Promise((resolve,reject) => anychartExport.exportTo(chart, 'png').then((image) => {
        fs.writeFile(`./bot/images/chart.png`, image, (fsWriteError) => {
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