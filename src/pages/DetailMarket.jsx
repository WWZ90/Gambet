import React, {useEffect, useState, useRef} from 'react'

import {useConnectWallet, useSetChain} from "@web3-onboard/react";

import {NavLink, useParams, useNavigate} from 'react-router-dom';

import {useStateContext} from '../contexts/ContextProvider';

import ReactEcharts from "echarts-for-react";

import Image1 from '../assets/img/slider/1.jpg';
import {NavBarWeb3Onboard} from '../components/NavBarWeb3Onboard';
import {OrderBook} from '../components/OrderBook';
import {ActionOrders} from '../components/ActionOrders';
import {OutcomeTable} from '../components/OutcomeTable';
import {Footer} from '../components/Footer';

import {browseMarkets, getOwned, getPrices, calculateCost, calculatePrice, fetchOrders} from '../utils/services';

export const DetailMarket = () => {

    const [{wallet, connecting}, connect, disconnect] = useConnectWallet();

    const navigate = useNavigate();

    const {id} = useParams();
    const {previousRoute, setPreviousRoute} = useStateContext(false);

    const {activeContract} = useStateContext();
    const {owner} = useStateContext();

    const {activeMarket, setActiveMarket} = useStateContext();
    const {marketId, setMarketId} = useStateContext();
    const {marketsArray, setMarketsArray} = useStateContext();
    const {orders, setOrders} = useStateContext();

    const [style, setStyle] = useState('collapse');
    const [showAboutCollapse, setShowAboutCollapse] = useState(false);

    const {outcomeData, setOutcomeData} = useStateContext();
    const {myOutcomeByMarket, setMyOutcomeByMarket} = useStateContext();
    const {setOutcomeOptionSelected} = useStateContext();

    const [loading, setLoading] = useState(true);
    const [marketExist, setMarketExist] = useState(false);
    const [loadingDetailMarket, setLoadingDetailMarket] = useState(false);
    const initialLoadingDetailMarketRef = useRef(loadingDetailMarket);

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
        } else {
            setStyle('collapse show')
            setShowAboutCollapse(true)
        }
    }


    useEffect(() => {
        if (initialLoadingDetailMarketRef.current === loadingDetailMarket) {
            console.log('primero');
            setOutcomeData([]);
            setMyOutcomeByMarket([]);

            setPreviousRoute(false);

            setLoadingDetailMarket(true);
            initialLoadingDetailMarketRef.current = true;
            loadDetailMarket().then(async () => {
                setLoadingDetailMarket(false);
                initialLoadingDetailMarketRef.current = false;
            });
        }

    }, [])

    const loadDetailMarket = async () => {
        if (!marketsArray || !marketsArray.length) {
            setPreviousRoute(id);
            setLoading(true);

            if (!localStorage.getItem('activeContract')) {
                await connect();
            }
            return;
        }

        const foundMarket = marketsArray.find(market => market.marketId === id);

        if (!foundMarket) {
            setMarketExist(false);
            return;
        }


        const seriesData = foundMarket.outcomes.map((name, index) => ({
            value: foundMarket.shares[index],
            name
        }));

        setOption((prevOption) => ({
            ...prevOption,
            series: prevOption.series.map((series) => ({
                ...series,
                data: seriesData,
            })),
        }));

        const owned = await getOwned(foundMarket, owner, activeContract)

        const averages = await getPrices(foundMarket, owned, owner, activeContract);

        foundMarket.owned = owned;
        foundMarket.averagePrice = averages;

        const outcomeD = foundMarket.outcomes.map((outcome, index) => ({
            outcome,
            owned: Number(owned[index]),
            share: Number(foundMarket.shares[index]),
            marketPrice: calculatePrice(foundMarket, outcome).toFixed(3),
            averagePrice: (Number.isNaN(averages[index]) || !Number.isFinite(averages[index])) ? "-" : averages[index],
            sharePayout: (1 / calculatePrice(foundMarket, outcome)).toFixed(3),
        }));

        setOutcomeData(outcomeD);

        const myOutcomeD = outcomeD.filter((entry) => entry.owned !== 0);

        setMyOutcomeByMarket(myOutcomeD);

        setOutcomeOptionSelected(outcomeD[0].outcome);

        fetchOrders(true, activeContract, id).then(setOrders);

        setActiveMarket(foundMarket);
        setMarketId(id);

        setMarketExist(true);
        setLoading(false);
    }

    useEffect(() => {
        console.log('activeContract');
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
        console.log('marketsArray');
        if (previousRoute) {
            setLoading(false);
            setPreviousRoute(false);
            loadDetailMarket().then();
        }
    }, [marketsArray])

    return (
        <>
            <NavBarWeb3Onboard/>

            {loading ? (
                <section className='detail_market'>
                    <div className="container align-items-center text-center">
                        <div className="lds-ripple">
                            <div></div>
                            <div></div>
                        </div>
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
                                                <img src={Image1}/>
                                            </div>
                                            <div>
                                                <div className='d-flex'>
                                                    <div
                                                        className='title_gray first'>Deadline: {activeMarket.deadline}</div>
                                                    <div
                                                        className='title_gray'>Resolution: {activeMarket.resolution}</div>
                                                </div>
                                                <div className='title'>{activeMarket.name}</div>
                                            </div>
                                        </div>
                                        <div className='details'>
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className="chart">
                                                        <ReactEcharts option={option}/>
                                                    </div>
                                                </div>
                                            </div>
                                            <OutcomeTable/>
                                            <OrderBook/>
                                            <div className="module">
                                                <div className='about'>
                                                    <h3>About</h3>
                                                    <p className={style} id="collapseAbout" aria-expanded="false">
                                                        This market will resolve to the winner of Argentina's 2023
                                                        presidential elections. If a tiebreaker is required to decide
                                                        the president, it will resolve to "Tiebreaker".
                                                        If a different candidate than the ones available in this market
                                                        wins, this market will resolve to "Other candidate".
                                                    </p>
                                                    <a role="button" onClick={updateCollapse} className="collapsed"
                                                       data-toggle="collapse" href="#collapseAbout"
                                                       aria-expanded="false" aria-controls="collapseAbout">
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
                                        <ActionOrders/>
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
                                    <NavLink to="/browsemarkets" className='btn-get-started connected'>Browse
                                        markets</NavLink>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}


            <Footer/>
        </>
    )
}
