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

import { getOwned, getPrices } from '../utils/services';

export const DetailMarket = () => {
    const { id } = useParams();

    const { activeContract } = useStateContext();
    const { owner } = useStateContext();

    const { activeMarket, setActiveMarket } = useStateContext();
    const { marketsArray, setMarketsArray } = useStateContext();

    const [style, setStyle] = useState('collapse');
    const [showAboutCollapse, setShowAboutCollapse] = useState(false);

    const { outcomeData, setOutcomeData } = useStateContext();
    const { myOutcomeByMarket, setMyOutcomeByMarket } = useStateContext();
    const { setOutcomeOptionSelected } = useStateContext();

    const [option, setOption] = useState({
        // Otras opciones del gráfico
        tooltip: {
            trigger: 'item',
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: [], // Inicialmente vacío
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    });

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



    useEffect(() => {
        const foundMarket = marketsArray.find((market) => market.marketId === id);

        if (foundMarket) {

            const seriesData = foundMarket.outcomes.map((name, index) => ({ value: foundMarket.shares[index], name }));

            setOption((prevOption) => ({
                ...prevOption, 
                series: prevOption.series.map((series) => ({
                    ...series,
                    data: seriesData,
                })),
            }));

            setActiveMarket(foundMarket);

            const data = foundMarket.outcomes.map((outcome, index) => ({
                outcome,
                owned: 0, 
                total: foundMarket.shares[index], 
                marketPrice: '$0.514', 
                averagePrice: '-', 
                sharePayout: '-', 
            }));

            setOutcomeData(data);

            setOutcomeOptionSelected(data[0].outcome)

            const getOw = async () => {
                setActiveMarket({...activeMarket, owned: await getOwned(foundMarket, owner, activeContract)});
            }

            getOw().then(async () => {
                setActiveMarket({...activeMarket, average: await getPrices(foundMarket, activeMarket.owned, owner, activeContract)})
            });
        }

        //console.log(marketsArray);

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
                                        <div className='title_gray'>Resolution: {activeMarket.resolution}</div>
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
