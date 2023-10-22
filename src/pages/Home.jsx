import React, { useEffect, useState, useRef } from 'react';

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { NavLink } from "react-router-dom";

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
            console.log("Active contract desde Home: ");
            console.log(activeContract);

            return await browseMarkets(activeContract);
        }

        if (activeContract)
            getMarkets().then(result => {
                setMarketsArray(result);
            });

    }, [activeContract])

    useEffect(() => {
        AOS.init();



        // Datos de outcome
        const data = [
            {
                outcome: 'Sergio Massa',
                owned: 40,
                total: 354,
                marketPrice: '$0.514',
                averagePrice: '$0.491',
                sharePayout: '$1.948',
            },
            {
                outcome: 'Patricia Bullrich',
                owned: 40,
                total: 100,
                marketPrice: '$0.514',
                averagePrice: '-',
                sharePayout: '$6.897',
            },
            {
                outcome: 'Javier Milei',
                owned: 0,
                total: 300,
                marketPrice: '$0.114',
                averagePrice: '-',
                sharePayout: '$2.948',
            },
            {
                outcome: 'Tiebreaker',
                owned: 0,
                total: 500,
                marketPrice: '$0.723',
                averagePrice: '-',
                sharePayout: '$1.948',
            },
            {
                outcome: 'Other candidate',
                owned: 0,
                total: 1,
                marketPrice: '$0.002',
                averagePrice: '-',
                sharePayout: '$689.432',
            },
        ];

        let data2 = [
            {
                outcome: 'Sergio Massa',
                owned: 40,
                total: 354,
                marketPrice: '$0.514',
                averagePrice: '$0.491',
                sharePayout: '$1.948',
            },
            {
                outcome: 'Patricia Bullrich',
                owned: 40,
                total: 100,
                marketPrice: '$0.514',
                averagePrice: '-',
                sharePayout: '$6.897',
            },
            {
                outcome: 'Other candidate',
                owned: 0,
                total: 1,
                marketPrice: '$0.002',
                averagePrice: '-',
                sharePayout: '$689.432',
            },
        ];

        setOutcomeData(data);
        setMyOutcomeByMarket(data2);

        setOutcomeOptionSelected(data[0].outcome)

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
                                    <a href="#" className="btn-get-started scrollto" onClick={async () => {
                                        const walletsConnected = await connect()
                                        console.log('connected wallets: ', walletsConnected)
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
