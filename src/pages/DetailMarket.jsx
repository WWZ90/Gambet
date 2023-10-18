import React, { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom';

import ReactEcharts from "echarts-for-react";

import Image1 from '../assets/img/slider/1.jpg';
import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard';
import { OrderBook } from '../components/OrderBook';
import { ActionOrders } from '../components/ActionOrders';

export const DetailMarket = () => {
    const { id } = useParams();

    const [style, setStyle] = useState('collapse')
    const [showAboutCollapse, setShowAboutCollapse] = useState(false)

    console.log('Renderizando de nuevo!')

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
                                        <div className='title_gray first'>Deadline: 2023-12-30</div>
                                        <div className='title_gray'>Lockout: 2023-10-21</div>
                                    </div>
                                    <div className='title'>Argentina 2023 Presidential Elections</div>
                                </div>
                            </div>
                            <div className='details'>
                                <div className="chart">
                                    <ReactEcharts option={option} />
                                </div>
                                <OrderBook data={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do"} />
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


                                </div>
                            </div>
                        </div>

                        <div className='stiky_block'>
                            <ActionOrders />
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}
