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
    const { myMarketOptionSelected, setMyMarketOptionSelected } = useStateContext();
    const { showModalMarket, setShowModalMarket } = useStateContext();
    const { showModalMyMarket, setShowModalMyMarket } = useStateContext();

    const { dataAsks, setDataAsks } = useStateContext([]); //Datos de Shares
    const { dataBids, setDataBids } = useStateContext([]); //Datos de Shares

    const { dataAsksPrice, setDataAsksPrice } = useStateContext([]); //Datos de Precio
    const { dataBidsPrice, setDataBidsPrice } = useStateContext([]); //Datos de Precio

    const [yAxisHeightAsks, setYAxisHeightAsks] = useState(10);
    const [yAxisHeightBids, setYAxisHeightBids] = useState(0);

    const [barWidth, setBarWidth] = useState(35);

    const handleClose = (type) => {
        setShowModalMyMarket(false);
    }


    const handleShow = (type) => {
        setShowModalMyMarket(true);
    }

    let myMarketOptions = ['Patricia Bullrich', 'Javier Milei', 'Other candidate'];

    console.log('Order Book')

    useEffect(() => {
        setMyMarketOptionSelected(myMarketOptions[0])
        console.log('entreeeee')
    }, [])

    //const barWidth = 35; // Tamaño fijo de las barras
    const barGap = 0.3; // Separación entre barras

    useEffect(() => {

        const updateChartOptions = () => {

            /*
            const newDataAsks = [];
            const newDataBids = [];

            const newDataAsksPrice = [];
            const newDataBidsPrice = [];

            for (let i = 0; i < 6; ++i) {
                newDataAsks.push(Math.round(Math.random() * 200));
                newDataAsksPrice.push(Math.round(Math.random() * 10));
            }
            for (let i = 0; i < 6; ++i) {
                newDataBids.push(Math.round(Math.random() * 100));
                newDataBidsPrice.push(Math.round(Math.random() * 10));
            }
            */


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
                                </Tab>
                                <Tab eventKey="my-orders" title="My Orders">
                                    <div className="select_markets_options">
                                        <div className="select_market" onClick={() => handleShow('myMarket')}>
                                            <span className='name'>{myMarketOptionSelected}</span>
                                            <span><i className="bi bi-caret-down"></i></span>
                                        </div>
                                    </div>

                                    <div className="last_price_data d-flex">
                                        <span className="col-10 text-end">Price</span>
                                        <span className="col-1 text-end">Shares</span>
                                    </div>

                                    <CenterModal
                                        show={showModalMyMarket}
                                        type={'myMarket'}
                                        options={myMarketOptions}
                                        onHide={handleClose}
                                    />


                                    <Echart type={'asks'} dataAsks={dataAsks} yAxisHeightAsks={yAxisHeightAsks} barWidth={barWidth} />

                                    <div className="last_price_data">
                                        <span>Last: $0.48</span>
                                        <span>Spread: $0.2</span>
                                    </div>

                                    <Echart type={'bids'} dataBids={dataBids} yAxisHeightBids={yAxisHeightBids} barWidth={barWidth} />
                                </Tab>
                            </Tabs>

                        </Accordion.Body>
                    )}

                </Accordion.Item>
            </Accordion>
        </>
    )
});
