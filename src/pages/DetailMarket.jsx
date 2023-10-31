import React, { useEffect, useState } from 'react'

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { NavLink, useParams, useNavigate } from 'react-router-dom';

import { useStateContext } from '../contexts/ContextProvider';

import ReactEcharts from "echarts-for-react";

import Image1 from '../assets/img/slider/1.jpg';
import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard';
import { OrderBook } from '../components/OrderBook';
import { ActionOrders } from '../components/ActionOrders';
import { OutcomeTable } from '../components/OutcomeTable';
import { Footer } from '../components/Footer';

import { browseMarkets, getOwned, getPrices, calculateCost, calculatePrice } from '../utils/services';

export const DetailMarket = () => {

    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

    const navigate = useNavigate();

    const { id } = useParams();
    const { previousRoute, setPreviousRoute } = useStateContext(false);

    const { activeContract } = useStateContext();
    const { owner } = useStateContext();

    const { activeMarket, setActiveMarket } = useStateContext();
    const { marketsArray, setMarketsArray } = useStateContext();

    const [style, setStyle] = useState('collapse');
    const [showAboutCollapse, setShowAboutCollapse] = useState(false);

    const { outcomeData, setOutcomeData } = useStateContext();
    const { myOutcomeByMarket, setMyOutcomeByMarket } = useStateContext();
    const { setOutcomeOptionSelected } = useStateContext();

    const [loading, setLoading] = useState(true);
    const [marketExist, setMarketExist] = useState();

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

        setOutcomeData([]);
        setMyOutcomeByMarket([]);

        setPreviousRoute(false);

        loadDetailMarket();

    }, [])

    const loadDetailMarket = () => {

        if (marketsArray) { //Si marketsArray esta vacio, significa que entro a esta ruta refrescando la pagina

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


                let ow = [];
                const getOw = async () => {
                    ow = await getOwned(foundMarket, owner, activeContract);
                    return ow;
                }

                let ap = [];
                getOw().then(async () => {
                    ap = await getPrices(foundMarket, ow, owner, activeContract);

                    foundMarket.owned = ow;
                    foundMarket.averagePrice = ap;

                    const outcomeD = foundMarket.outcomes.map((outcome, index) => ({
                        outcome,
                        owned: Number(ow[index]),
                        share: Number(foundMarket.shares[index]),
                        marketPrice: calculatePrice(foundMarket, outcome).toFixed(3),
                        averagePrice: (Number.isNaN(ap[index]) || !Number.isFinite(ap[index])) ? "-" : ap[index],
                        sharePayout: (1 / calculatePrice(foundMarket, outcome)).toFixed(3),
                    }));

                    setOutcomeData(outcomeD);

                    const myOutcomeD = outcomeD.filter((entry) => entry.owned !== 0);

                    setMyOutcomeByMarket(myOutcomeD);

                    setOutcomeOptionSelected(outcomeD[0].outcome);
                });

                setActiveMarket(foundMarket);

                console.log(activeMarket);

                setMarketExist(true);
                setLoading(false);

            } else {
                setMarketExist(false);
            }
        } else {
            if (!localStorage.getItem('activeContract')) {
                connect();
                setPreviousRoute(id);
                setLoading(true);
            } else {
                setPreviousRoute(id);
                setLoading(true);
            }
        }
    }

    useEffect(() => {
        if (previousRoute) {

            const getMarkets = async () => {
                return await browseMarkets(activeContract);
            }

            getMarkets().then(result => {
                setMarketsArray(result);
            });
        }
    }, [activeContract])

    useEffect(() => {
        if (previousRoute) {
            setLoading(false);
            setPreviousRoute(false);
            loadDetailMarket();
        }
    }, [marketsArray])

    return (
        <>
            <NavBarWeb3Onboard />

            {loading ? (
                <section className='detail_market'>
                    <div className="container align-items-center text-center">
                        <div className="lds-ripple"><div></div><div></div></div>
                    </div>
                </section>
            ) : (
                <>
                    {marketExist ? (
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
                    ) : (
                        <section className='detail_market'>
                            <div className="content no_market">
                                <div>
                                    The market you are requesting does not exist
                                </div>
                                <div>
                                    <NavLink to="/browsemarkets" className='btn-get-started connected'>Browse markets</NavLink>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}




            <Footer />
        </>
    )
}
