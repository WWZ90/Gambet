import React, { useRef, useState, useEffect } from 'react'

import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import ReactEcharts from "echarts-for-react";
import { CenterModal } from './CenterModal';

import { useStateContext } from '../contexts/ContextProvider';
import { Echart } from './Echart';
import {groupOrders} from "../utils/services.js";

export const OrderBook = React.memo(({ parameters }) => {
    const { showModalMarket, setShowModalMarket } = useStateContext();
    const { showModalMyMarket, setShowModalMyMarket } = useStateContext();

    const { setOptionActive } = useStateContext(); //Control de si tiene seleccionado en Orders o My Orders
    const { dataAsks, setDataAsks } = useStateContext([]); //Datos de Shares
    const { dataBids, setDataBids } = useStateContext([]); //Datos de Shares

    const { dataAsksPrice, setDataAsksPrice } = useStateContext([]); //Datos de Precio
    const { dataBidsPrice, setDataBidsPrice } = useStateContext([]); //Datos de Precio

    const { orders, setOrders } = useStateContext();


    const [yAxisHeightAsks, setYAxisHeightAsks] = useState(10);
    const [yAxisHeightBids, setYAxisHeightBids] = useState(0);

    const [barWidth, setBarWidth] = useState(35);

    const { outcomeOptionSelected } = useStateContext();

    const handleClose = (type) => {
        setShowModalMyMarket(false);
    }


    const handleShow = (type) => {
        setShowModalMyMarket(true);
    }

 

    //const barWidth = 35; // Tamaño fijo de las barras
    const barGap = 0.3; // Separación entre barras

    useEffect(() => {

        const updateChartOptions = () => {

            const groupedOrders = groupOrders(orders).filter(o => o.outcome === outcomeOptionSelected);

            const newDataAsks = groupedOrders.filter(o => o.orderPosition === 'SELL').map(o => o.amount);
            const newDataAsksPrice = groupedOrders.filter(o => o.orderPosition === 'SELL').map(o => "$" + o.pricePerShare);

            const newDataBids = groupedOrders.filter(o => o.orderPosition === 'BUY').map(o => o.amount);
            const newDataBidsPrice = groupedOrders.filter(o => o.orderPosition === 'BUY').map(o => "$" + o.pricePerShare);

            setDataAsks(newDataAsks);
            setDataBids(newDataBids);

            setDataAsksPrice(newDataAsksPrice);
            setDataBidsPrice(newDataBidsPrice);

            setYAxisHeightAsks(newDataAsks.length * (barWidth + barGap));
            setYAxisHeightBids(newDataBids.length * (barWidth + barGap));

        }

        updateChartOptions();

    }, [orders, outcomeOptionSelected])

    const handleTabChange = (eventKey) => {
        setOptionActive(eventKey);
      };

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
                                onSelect={handleTabChange}
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

                                    
                                </Tab>
                            </Tabs>

                        </Accordion.Body>
                    )}

                </Accordion.Item>
            </Accordion>
        </>
    )
});
