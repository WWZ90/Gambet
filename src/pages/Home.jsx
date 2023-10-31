import React, { useEffect, useState, useRef } from 'react';

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { NavLink, useNavigate } from "react-router-dom";

import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import { useStateContext } from '../contexts/ContextProvider'

import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'

import heroLogo from '../assets/img/hero-img.png';

import { browseMarkets, truncateText } from '../utils/services';


import AOS from 'aos';
import 'aos/dist/aos';

import { FreqAskQ } from '../components/FreqAskQ';
import { Footer } from '../components/Footer';
import { MarketTabs } from '../components/MarketTabs';

export const Home = () => {

    const navigate = useNavigate();

    const { previousRoute, setPreviousRoute } = useStateContext();

    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

    const { activeContract, setActiveContract } = useStateContext();
    const { marketsArray, setMarketsArray } = useStateContext();
    const { outcomeData, setOutcomeData } = useStateContext();
    const { myOutcomeByMarket, setMyOutcomeByMarket } = useStateContext();
    const { setOutcomeOptionSelected } = useStateContext();

    const heroRef = useRef(null);
    const marketTabsRef = useRef(null);

    useEffect(() => {

        const getMarkets = async () => {
            return await browseMarkets(activeContract);
        }

        if (activeContract)
            if (!marketsArray) {
                getMarkets().then(result => {
                    setMarketsArray(result);

                    if (previousRoute) {
                        const goToDetailMarket = () => navigate(`/market/id/${previousRoute}`);

                        goToDetailMarket();
                    }
                });
            }
    }, [activeContract])

    useEffect(() => {
        AOS.init();

    }, [])


    const categories = ['Trending', 'New', 'Ending Soon', 'Volume', 'Liquidity'];

    return (
        <>
            <NavBarWeb3Onboard />

            <section className='hero' id='hero' ref={heroRef}>
                <div className="container position-relative align-items-center">
                    <div className="row">
                        <div className="col-lg-6 d-flex flex-column justify-content-center pt-4 pt-lg-0 order-2 order-lg-1" data-aos="fade-up" data-aos-delay="200">
                            <h1>Gambeth</h1>
                            <h2>A fully decentralized, blockchain-based web application in which anyone can participate on or create their own parimutuel betting pools.</h2>
                            <div className="d-flex justify-content-center justify-content-lg-start">
                                {!wallet ? (
                                    <a href="#" className="btn-get-started" onClick={async () => {
                                        const walletsConnected = await connect()
                                    }}>Connect your wallet</a>
                                ) : (
                                    <NavLink to="/browsemarkets" className='btn-get-started connected'>Browse markets</NavLink>
                                )}

                            </div>
                        </div>
                        <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-in" data-aos-delay="200">
                            <img src={heroLogo} className="img-fluid animated" alt="" />
                        </div>
                    </div>
                </div>
            </section >

            <MarketTabs categories={categories} myRef={marketTabsRef} />

            <FreqAskQ />

            <Footer />
        </>
    )
}
