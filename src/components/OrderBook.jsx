import React, { useRef, useState, useEffect } from 'react'

import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import ReactEcharts from "echarts-for-react";
import { CenterModal } from './CenterModal';

import { useStateContext } from '../contexts/ContextProvider';
import { Echart } from './Echart';

export const OrderBook = React.memo(({ parameters }) => {
    const { showModalMarket, setShowModalMarket } = useStateContext();
    const { showModalMyMarket, setShowModalMyMarket } = useStateContext();

    const { dataAsks, setDataAsks } = useStateContext([]); //Datos de Shares
    const { dataBids, setDataBids } = useStateContext([]); //Datos de Shares

    const { dataAsksPrice, setDataAsksPrice } = useStateContext([]); //Datos de Precio
    const { dataBidsPrice, setDataBidsPrice } = useStateContext([]); //Datos de Precio

    const { marketOptionSelected, setMarketOptionSelected } = useStateContext();
    const { myMarketOptionSelected, setMyMarketOptionSelected } = useStateContext();

    const [yAxisHeightAsks, setYAxisHeightAsks] = useState(10);
    const [yAxisHeightBids, setYAxisHeightBids] = useState(0);

    const [barWidth, setBarWidth] = useState(35);

    const handleClose = (type) => {
        setShowModalMyMarket(false);
    }


    const handleShow = (type) => {
        setShowModalMyMarket(true);
    }

    let marketOptions = [
        { name: 'Sergio Massa', price: '$0.514' },
        { name: 'Patricia Bullrich', price: '$0.514' },
        { name: 'Javier Milei', price: '$0.114' },
        { name: 'Tiebreaker', price: '$0.723' },
        { name: 'Other candidate', price: '$0.002' },
    ];

    let myMarketOptions = [
        { name: 'Patricia Bullrich', price: '$0.514' },
        { name: 'Tiebreaker', price: '$0.723' },
        { name: 'Other candidate', price: '$0.002' },
    ];

    console.log('Order Book')

    useEffect(() => {
        setMarketOptionSelected(marketOptions[0].name)
        console.log('entreeeee')
    }, [])

    //const barWidth = 35; // Tamaño fijo de las barras
    const barGap = 0.3; // Separación entre barras

    useEffect(() => {

        const updateChartOptions = () => {

            const newDataAsks = ['135', '200', '256', '356', '400', '452'];
            const newDataAsksPrice = ['$0.54', '$0.6', '$0.7', '$0.8', '$0.9', '$0.95'];

            const newDataBids = ['56', '150', '280', '289', '350', '402']
            const newDataBidsPrice = ['$0.44', '$0.35', '$0.32', '$0.25', '$0.20', '$0.15'];


            setDataAsks(newDataAsks);
            setDataBids(newDataBids);

            setDataAsksPrice(newDataAsksPrice);
            setDataBidsPrice(newDataBidsPrice);

            setYAxisHeightAsks(newDataAsks.length * (barWidth + barGap));
            setYAxisHeightBids(newDataBids.length * (barWidth + barGap));

        }

        updateChartOptions();

        console.log('Entro a actualizar data');

    }, [])



    return (
        <>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Order Book</Accordion.Header>
                    {dataAsks && (
                        <Accordion.Body>
                            <Tabs
                                defaultActiveKey="orders"
                                id="fill-tab-orders-book"
                                className="mb-3"
                                fill
                            >
                                <Tab eventKey="orders" title="Orders">
                                    <div className="last_price_data d-flex">
                                        <span className="col-10 text-end">Price</span>
                                        <span className="col-1 text-end">Shares</span>
                                    </div>

                                    <Echart type={'asks'} yAxisHeightAsks={yAxisHeightAsks} barWidth={barWidth} />

                                    <div className="last_price_data">
                                        <span>Last: $0.48</span>
                                        <span>Spread: $0.2</span>
                                    </div>

                                    <Echart type={'bids'} yAxisHeightBids={yAxisHeightBids} barWidth={barWidth} />

                                    <div className='d-flex flex-row flex-wrap'>
                                        {marketOptions.map((option, index) => (
                                            <div key={index} className={`market_option d-flex mb-2 mr-2 ${marketOptionSelected == option.name ? 'active' : ''}`} onClick={() => setMarketOptionSelected(option.name)} label={option.name}>
                                                <span className="mr-2">
                                                    <i className="bi bi-check2-circle"></i>
                                                </span>
                                                <div className='d-flex'>
                                                    <p>{option.name}</p>
                                                    <p className='price'>{option.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </Tab>
                                <Tab eventKey="my-orders" title="My Orders">
                                    <div className="last_price_data d-flex">
                                        <span className="col-10 text-end">Price</span>
                                        <span className="col-1 text-end">Shares</span>
                                    </div>

                                    <Echart type={'asks'} dataAsks={dataAsks} yAxisHeightAsks={yAxisHeightAsks} barWidth={barWidth} />

                                    <div className="last_price_data">
                                        <span>Last: $0.48</span>
                                        <span>Spread: $0.2</span>
                                    </div>

                                    <Echart type={'bids'} dataBids={dataBids} yAxisHeightBids={yAxisHeightBids} barWidth={barWidth} />

                                    <div className='d-flex flex-row flex-wrap'>
                                        {myMarketOptions.map((option, index) => (
                                            <div key={index} className={`market_option d-flex align-items-center mb-2 mr-2 ${marketOptionSelected == option.name ? 'active' : ''}`} onClick={() => setMarketOptionSelected(option.name)} label={option.name}>
                                                <span className="mr-2">
                                                    <i className="bi bi-check2-circle"></i>
                                                </span>
                                                <div className='d-flex'>
                                                    <p>{option.name}</p>
                                                    <p className='price'>{option.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Tab>
                            </Tabs>

                        </Accordion.Body>
                    )}

                </Accordion.Item>
            </Accordion>
        </>
    )
});
