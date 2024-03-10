import React, { useEffect, useState, useRef } from 'react'

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { NavLink, useParams, useNavigate } from 'react-router-dom';

import Countdown from 'react-countdown';

import { useStateContext } from '../contexts/ContextProvider';

import ReactEcharts from "echarts-for-react";

import Image1 from '../assets/img/image_upload.png';

import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard';
import { OrderBook } from '../components/OrderBook';
import { ActionOrders } from '../components/ActionOrders';
import { OutcomeTable } from '../components/OutcomeTable';
import { Footer } from '../components/Footer';

import { browseMarkets, getOwned, getPrices, calculateCost, calculatePrice, fetchOrders } from '../utils/services';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export const DetailMarket = () => {

    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

    const navigate = useNavigate();

    const { id } = useParams();
    const { previousRoute, setPreviousRoute } = useStateContext(false);

    const { activeContract } = useStateContext();
    const { owner } = useStateContext();

    const { activeMarket, setActiveMarket } = useStateContext();
    const { marketId, setMarketId } = useStateContext();
    const { marketsArray, setMarketsArray } = useStateContext();
    const { orders, setOrders } = useStateContext();

    const [style, setStyle] = useState('collapse');
    const [showAboutCollapse, setShowAboutCollapse] = useState(false);

    const { outcomeData, setOutcomeData } = useStateContext();
    const { myOutcomeByMarket, setMyOutcomeByMarket } = useStateContext();
    const { setOutcomeOptionSelected } = useStateContext();

    const [loading, setLoading] = useState(true);
    const [marketExist, setMarketExist] = useState(true);
    const [loadingDetailMarket, setLoadingDetailMarket] = useState(true);
    const initialLoadingDetailMarketRef = useRef(loadingDetailMarket);

    const Completionist = () => <span>You are good to go!</span>;

    // Renderer callback with condition
    const renderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            // Render a complete state
            return <Completionist />;
        } else {
            // Render a countdown
            return (
                <span className='pl-5'>
                    {days} D : {hours} H : {minutes} M : {seconds} S
                </span>
            );
        }
    };

    var colorPalette = ['#41448b', '#8f000d', '#ffbf00', '#ff0000', '#33394B', '#22b75c', '#9d5215', '#159d8f', '#15609d', '#4e159d', '#ffffff'];

    const [option, setOption] = useState({
        // Otras opciones del gráfico
        backgroundColor: '#02024B',
        tooltip: {
            trigger: 'item',
        },
        borderRadius: 5,
        textStyle: {
            fontFamily: 'Saira-Regular'
        },
        series: [
            {
                type: 'pie',
                radius: '60%', // Increase this percentage to reduce padding
                data: [], // Inicialmente vacío
                color: colorPalette,
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

        if (initialLoadingDetailMarketRef.current !== loadingDetailMarket) {
            return;
        }

        setActiveMarket([]);

        setOutcomeData([]);
        setMyOutcomeByMarket([]);

        setPreviousRoute(false);

        initialLoadingDetailMarketRef.current = true;
        loadDetailMarket().then(async () => {
            setLoadingDetailMarket(false);
            initialLoadingDetailMarketRef.current = false;
        });


    }, [owner])

    const loadDetailMarket = async (marketReload) => {

        if (!marketsArray || !marketsArray.length) {
            setPreviousRoute(id);
            console.log("Not loading market");
            return;
        }

        console.log("Loading market");

        let foundMarket = null;

        if (marketReload)
            foundMarket = marketReload;
        else
            foundMarket = marketsArray.find(market => market.marketId === id);

        setActiveMarket(foundMarket);

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

        const user = owner || "0x0000000000000000000000000000000000000000";

        console.log(user);

        const owned = await getOwned(foundMarket, user, activeContract)

        const averages = await getPrices(foundMarket, owned, user, activeContract);

        foundMarket.owned = owned;
        foundMarket.averagePrice = averages;

        const outcomeD = foundMarket.outcomes.map((outcome, index) => ({
            outcome,
            image: foundMarket.outcomeImages[index],
            owned: Number(owned[index]),
            share: Number(foundMarket.shares[index]),
            marketPrice: calculatePrice(foundMarket, outcome).toFixed(3),
            averagePrice: (Number.isNaN(averages[index]) || !Number.isFinite(averages[index])) ? "-" : averages[index],
            sharePayout: (1 / calculatePrice(foundMarket, outcome)).toFixed(3),
        }));

        //debugger;

        setOutcomeData(outcomeD);

        const myOutcomeD = outcomeD.filter((entry) => entry.owned !== 0);

        setMyOutcomeByMarket(myOutcomeD);

        setOutcomeOptionSelected(outcomeD[0].outcome);

        fetchOrders(true, activeContract, id).then(setOrders);

        setActiveMarket(foundMarket);
        setMarketId(id);
    }

    useEffect(() => {
        if (!previousRoute) {
            return;
        }
        browseMarkets(activeContract).then(setMarketsArray);
    }, [activeContract])

    useEffect(() => {
        if (marketsArray) {
            setMarketExist(true);
        }

        if (!previousRoute) {

            return;
        }

        setMarketExist(true);
        setPreviousRoute(false);
        loadDetailMarket().then(async () => {

        });

    }, [marketsArray, owner])

    useEffect(() => {
        if (outcomeData.length != 0) {
            setLoading(false);
        }
    }, [outcomeData])


    return (
        <>
            <div className="image-back">
                <NavBarWeb3Onboard />
                <div className='header-fill'></div>

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
                        {outcomeData ? (
                            <section className='detail_market'>
                                <div className="content">
                                    <div className="inside">
                                        <div className="left_panel">
                                            <div className="row top">

                                                {activeMarket.marketImage && activeMarket.marketImage.match(/\.(jpeg|jpg|gif|png)$/) !== null ? (
                                                    <div className='col-2 image'>
                                                        <img src={activeMarket.marketImage}></img>
                                                    </div>
                                                ) : (
                                                    <div className='col-2 image'>
                                                        <img src={Image1}></img>
                                                    </div>
                                                )}

                                                <div className='col-9 p-0 r-details'>
                                                    <div className='row'>
                                                        <div className='col-6 text_gray first'
                                                            style={{ fontSize: '13px' }}>
                                                            <OverlayTrigger
                                                                overlay={<Tooltip
                                                                    id="tooltip-decrement">{activeMarket.resolution}</Tooltip>}
                                                                placement="top"
                                                            >
                                                                <i className="bi bi-info-circle pt-2 pr-2"></i>
                                                            </OverlayTrigger>
                                                            <span>Locked:</span>
                                                            <Countdown date={activeMarket.resolution}
                                                                renderer={renderer} />
                                                        </div>
                                                        <div className='col-6 text_gray' style={{ fontSize: '13px' }}>
                                                            <OverlayTrigger
                                                                overlay={<Tooltip
                                                                    id="tooltip-decrement">{activeMarket.deadline}</Tooltip>}
                                                                placement="top"
                                                            >
                                                                <i className="bi bi-info-circle pt-2 pr-2"></i>
                                                            </OverlayTrigger>
                                                            <span>Deadline:</span>
                                                            <Countdown date={activeMarket.deadline}
                                                                renderer={renderer} />
                                                        </div>

                                                    </div>
                                                    <div className='row d-flex aling-align-items-center title'>
                                                        {activeMarket.name}
                                                    </div>

                                                </div>
                                            </div>
                                            <div className='details'>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="chart">
                                                            <div style={{
                                                                display: 'flex',
                                                                flexDirection: outcomeData.length > 3 ? 'row' : 'column',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: outcomeData.length > 3 ? '30px' : '0px',
                                                                padding: outcomeData.length > 3 ? '20px' : '0px',
                                                                height: outcomeData.length > 3 ? '32px' : '140px',
                                                                width: outcomeData.length > 3 ? '100%' : 'auto',
                                                                marginTop: outcomeData.length > 3 ? '40px' : '10px'
                                                            }}>
                                                                {outcomeData.map((item, index) => (
                                                                    <div key={index} style={{
                                                                        display: 'flex',
                                                                        height: '240px',
                                                                        width: '500px',
                                                                        flexDirection: outcomeData.length > 3 ? 'column' : 'row-reverse',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        <div style={{
                                                                            color: '#F3F9D2',
                                                                            fontFamily: 'var(--font-family-light)',
                                                                            fontSize: '12px',
                                                                            fontStyle: 'normal',
                                                                            fontWeight: '300',
                                                                            marginBottom: '4px'
                                                                        }}>{`${(item.marketPrice ** 2).toFixed(3) * 100}%`}</div>
                                                                        <div className="" style={{ position: 'relative', borderRadius: '30px', height: outcomeData.length > 3 ? '100%' : '32px', background: '#1C1D60', width: outcomeData.length > 3 ? '34px' : '100%'}}>
                                                                            <div style={{
                                                                                background: 'linear-gradient(180deg, rgba(247,180,161,1) 0%, rgba(249,117,81,1) 100%)',
                                                                                borderRadius: '30px',
                                                                                [outcomeData.length > 3 ? 'width' : 'height']: '34px',
                                                                                [outcomeData.length > 3 ? 'height' : 'width']: `${(item.marketPrice ** 2).toFixed(3) * 100}%`,
                                                                                transition: 'height 0.3s ease-in-out',
                                                                                boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.2)',
                                                                                position: 'absolute',
                                                                                bottom: '0'
                                                                            }} />
                                                                        </div>

                                                                        <div style={{
                                                                            color: '#F3F9D2',
                                                                            fontFamily: 'var(--font-family-light)',
                                                                            fontSize: '12px',
                                                                            fontStyle: 'normal',
                                                                            fontWeight: '300',
                                                                            textTransform: 'capitalize',
                                                                            display: 'flex',
                                                                            justifyContent: 'center',
                                                                            width: "20%",
                                                                            alignContent: 'center',
                                                                            textAlign: 'center',
                                                                            marginTop: '4px'
                                                                        }}>{item.outcome}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <OutcomeTable />

                                                <OrderBook />

                                                <div className="module">
                                                    <div className='about'>
                                                        <h3 className=''>About</h3>
                                                        <p className='' id="collapseAbout" aria-expanded="true">
                                                            {activeMarket.terms}
                                                        </p>
                                                        {/*
                                                        <a role="button" onClick={updateCollapse} className="collapsed"
                                                            data-toggle="collapse" href="#collapseAbout"
                                                            aria-expanded="false" aria-controls="collapseAbout">
                                                            {!showAboutCollapse ? ('+ Show more') : ('- Show less')}
                                                        </a>
                                                    */}

                                                    </div>
                                                    <div className='resolution_outcome'>
                                                        <h3 className=''>Resolution</h3>
                                                        <p className=''>No outcome has been proposed yet.</p>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                        <div className='stiky_block'>
                                            <ActionOrders loadDetailMarket={loadDetailMarket} />
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


                <Footer />
            </div >
        </>
    )
}
