import React from 'react'

import ReactEcharts from "echarts-for-react";

import { useStateContext } from '../contexts/ContextProvider';

export const Echart = React.memo(({ type, yAxisHeightAsks, yAxisHeightBids, barWidth }) => {

    console.log('Echart')

    const { dataAsks } = useStateContext([]); //Datos de Shares
    const { dataBids } = useStateContext([]); //Datos de Shares

    const { dataAsksPrice } = useStateContext([]); //Datos de Precio
    const { dataBidsPrice } = useStateContext([]); //Datos de Precio

    const optionAsks = {
        grid: {
            left: '-1%',
            top: '0%',
            right: '5%',
            bottom: '0%',
            height: yAxisHeightAsks + 'px', // Ajusta el alto del eje y
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow',
            },
        },
        series: [
            {
                realtimeSort: true,
                type: 'bar',
                data: dataAsks, //Datos de Shares
                barWidth: barWidth, // Tamaño fijo de las barras
                itemStyle: {
                    color: 'rgba(207, 46, 46, 0.55)',
                    shadowColor: 'rgba(207, 46, 46, 0.55)',
                    opacity: 0.5
                },
                // Agregar evento para cambiar el color al pasar el mouse
                emphasis: {
                    itemStyle: {
                        color: 'rgba(207, 46, 46, 0.9)', // Color de las barras al pasar el mouse
                    },
                },
                label: {
                    show: false,
                    position: 'right',
                    valueAnimation: false,
                    color: 'red',
                    fontSize: 14,
                    fontFamily: 'Gilroy-Bold',
                },
                /*
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(207, 46, 46, 0.1)'
                }
                */
            }
        ],
        xAxis: {
            max: 'dataMax',
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            },
        },
        yAxis: {
            type: 'category',
            data: dataAsksPrice,
            inverse: true,
            min: 0,
            label: {
                show: false,
            },
            axisLabel: {
                interval: 0,
                margin: '0',
                show: false,

                textStyle: {
                    color: 'red',
                    fontSize: 12,
                    fontFamily: 'Gilroy-Regular',
                },
            },
            animationDuration: 300,
            animationDurationUpdate: 300,
        },
        animationDuration: 0,
        animationDurationUpdate: 1000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear'
    };

    const optionBids = {
        grid: {
            left: '-1%',
            top: '0%',
            right: '5%',
            bottom: '1%',
            height: yAxisHeightBids + 'px', // Ajusta el alto del eje y
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow',
            },
        },
        series: [
            {
                realtimeSort: true,
                type: 'bar',
                data: dataBids, //Datos de Shares
                barWidth: barWidth, // Tamaño fijo de las barras
                itemStyle: {
                    color: 'rgba(39, 174, 96, 0.55)',
                    shadowColor: 'rgba(39, 174, 96, 0.55)',
                    borderType: 'dashed',
                    opacity: 0.5
                },
                // Agregar evento para cambiar el color al pasar el mouse
                emphasis: {
                    itemStyle: {
                        color: 'rgba(39, 174, 96, 0.9)', // Color de las barras al pasar el mouse

                    },
                },
                //showBackground: true,
                label: {
                    show: false,
                    position: 'right',
                    valueAnimation: false,
                    color: 'green',
                    fontSize: 14,
                    fontFamily: 'Gilroy-Bold',
                }
            }
        ],
        xAxis: {
            max: 'dataMax',
            axisLabel: {
                show: false
            },
            splitLine: {
                show: false
            },
        },
        yAxis: {
            type: 'category',
            data: dataBidsPrice,
            inverse: false,
            min: 0,
            axisLabel: {
                interval: 0,
                margin: '10',
                show: false,
                textStyle: {
                    color: 'green',
                    fontSize: 14,
                    fontFamily: 'Gilroy-Bold',
                },
            },
            splitLine: {
                show: false
            },
            animationDuration: 300,
            animationDurationUpdate: 300,
            //max: 1 // only the largest 3 bars will be displayed
        },
        animationDuration: 0,
        animationDurationUpdate: 1000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear'
    };


    const onChartClick_Asks = (params) => {
        if (params.componentType === 'series' && params.dataIndex !== undefined) {
            // Verificar si el evento se disparó en la serie de barras y no en otro lugar
            const dataIndex = params.dataIndex; // Obtener el índice de datos
            const selectedCategory = optionAsks.yAxis.data[dataIndex]; // Obtener el valor del label en el eje Y
            console.log(`Categoría seleccionada: ${selectedCategory}`);
        }
    };

    const onChartClick_Bids = (params) => {
        if (params.componentType === 'series' && params.dataIndex !== undefined) {
            // Verificar si el evento se disparó en la serie de barras y no en otro lugar
            const dataIndex = params.dataIndex; // Obtener el índice de datos
            const selectedCategory = optionBids.yAxis.data[dataIndex]; // Obtener el valor del label en el eje Y
            console.log(`Categoría seleccionada: ${selectedCategory}`);
        }
    };

    return (
        <>
            <div className="order_block_asks">
                <div className='row'>

                    {type == 'asks' ? (
                        <>
                            <div className="col-9">
                                <ReactEcharts
                                    option={optionAsks}
                                    onEvents={{
                                        click: onChartClick_Asks,
                                    }}
                                    style={{ height: yAxisHeightAsks, width: '100%' }}
                                />
                            </div>
                            <div className="col-3">


                                <div className="row price_shares">
                                    <div className="col-7 text-center">
                                        {dataAsksPrice.slice().reverse().map((price, index) => (
                                            <div key={index} className='option price'>{price}</div>
                                        ))}
                                    </div>
                                    <div className="col-1 text-left">
                                        {dataAsks.slice().reverse().map((shares, index) => (
                                            <div key={index} className='option share'>{shares}</div>
                                        ))}
                                    </div>
                                </div>


                            </div>


                        </>
                    ) : (

                        <>
                            <div className="col-9">
                                <ReactEcharts
                                    option={optionBids}
                                    onEvents={{
                                        click: onChartClick_Bids,
                                    }}
                                    style={{ height: yAxisHeightBids, width: '100%' }}
                                />
                            </div>
                            <div className="col-3">


                                <div className="row price_shares">
                                    <div className="col-7 text-center">
                                        {dataBidsPrice.map((price, index) => (
                                            <div key={index} className='option price'>{price}</div>
                                        ))}
                                    </div>
                                    <div className="col-1 text-left">
                                        {dataBids.map((shares, index) => (
                                            <div key={index} className='option share'>{shares}</div>
                                        ))}</div>
                                </div>


                            </div>
                        </>

                    )}
                </div>
            </div>
        </>
    )
});
