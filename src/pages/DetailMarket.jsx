import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom';

import { useStateContext } from '../contexts/ContextProvider';

import ReactEcharts from "echarts-for-react";

import Image1 from '../assets/img/slider/1.jpg';
import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard';
import { OrderBook } from '../components/OrderBook';
import { ActionOrders } from '../components/ActionOrders';
import { OutcomeTable } from '../components/OutcomeTable';
import { Footer } from '../components/Footer';

export const DetailMarket = () => {
    const { id } = useParams();

    const { activeMarket, setActiveMarket } = useStateContext();
    const { marketsArray, setMarketsArray } = useStateContext();

    const [style, setStyle] = useState('collapse')
    const [showAboutCollapse, setShowAboutCollapse] = useState(false)


    const updateCollapse = () => {
        if (showAboutCollapse) {
            setStyle('collapse')
            setShowAboutCollapse(false)
        }
        else {
            setStyle('collapse show')
            setShowAboutCollapse(true)
        }
    }

    const option = {
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 314, name: 'Sergio Massa' },
                    { value: 100, name: 'Patricia Bullrich	' },
                    { value: 300, name: 'Javier Milei	' },
                    { value: 500, name: 'Tiebreaker' },
                    { value: 1, name: 'Other candidate	' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    useEffect(() => {
        // Buscar el elemento en marketsArray con el ID deseado
        const foundMarket = marketsArray.find((market) => market.marketId === id);

        // Si se encuentra el elemento, copiarlo a activeMarket
        if (foundMarket) {
            setActiveMarket(foundMarket);
        }

        const date = Date(foundMarket.deadline * 1000);

        console.log(date);

        console.log(marketsArray);

    }, [])


    return (
        <>
            <NavBarWeb3Onboard />

            <section className='detail_market'>
                <div className="content">
                    <div className="inside">
                        <div className="left_panel">
                            <div className="top">
                                <div className="image">
                                    <img src={Image1} />
                                </div>
                                <div>
                                    <div className='d-flex'>
                                        <div className='title_gray first'>Deadline: {activeMarket.deadline}</div>
                                        <div className='title_gray'>Lockout: {activeMarket.lockout}</div>
                                    </div>
                                    <div className='title'>{activeMarket.name}</div>
                                </div>
                            </div>
                            <div className='details'>
                                <div className="row">
                                    <div className="col-12">
                                        <div className="chart">
                                            <ReactEcharts option={option} />
                                        </div>
                                    </div>
                                </div>
                                <OutcomeTable />
                                <OrderBook />
                                <div className="module">
                                    <div className='about'>
                                        <h3>About</h3>
                                        <p className={style} id="collapseAbout" aria-expanded="false">
                                            This market will resolve to the winner of Argentina's 2023 presidential elections. If a tiebreaker is required to decide the president, it will resolve to "Tiebreaker".
                                            If a different candidate than the ones available in this market wins, this market will resolve to "Other candidate".
                                        </p>
                                        <a role="button" onClick={updateCollapse} className="collapsed" data-toggle="collapse" href="#collapseAbout" aria-expanded="false" aria-controls="collapseAbout">
                                            {!showAboutCollapse ? ('+ Show more') : ('- Show less')}
                                        </a>
                                    </div>
                                    <div className='resolution_outcome mt-4'>
                                        <h3>Resolution</h3>
                                        <p>No outcome has been proposed yet.</p>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className='stiky_block'>
                            <ActionOrders />
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </>
    )
}
