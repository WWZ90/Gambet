import React, { useEffect, useState, useRef } from 'react';

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { NavLink, useNavigate } from "react-router-dom";

import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import { useStateContext } from '../contexts/ContextProvider'

import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'


import { browseMarkets, truncateText } from '../utils/services';

import heroLogo from '../assets/img/hero-img.png';
import magnifying from '../assets/icons/png/noto_magnifying-glass-tilted-left.png';
import artist_palette from '../assets/icons/png/noto_artist-palette.png';
import rocket from '../assets/icons/png/noto_rocket.png';

import AOS from 'aos';
import 'aos/dist/aos';

import { FreqAskQ } from '../components/FreqAskQ';
import { Footer } from '../components/Footer';
import { MarketTabs } from '../components/MarketTabs';
import { Button } from '../components/Button';
import { EducationSection } from '../components/EducationSection';

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

    const handleConnectWallet = async () => {
        const walletsConnected = await connect();
    };

    useEffect(() => {

        if (!previousRoute && activeContract) {

            const getMarkets = async () => {
                return await browseMarkets(activeContract);
            }

            if (!marketsArray) {
                getMarkets().then(result => {
                    //console.log(result);
                    setMarketsArray(result);
                });
            }
        }
    }, [activeContract])

    const categories = ['Trending', 'New', 'Ending Soon', 'Volume', 'Liquidity'];

    return (
        <>
            <div className="image-back">

                <NavBarWeb3Onboard />

                <section className='hero' id='hero' ref={heroRef}>
                    <div className="container position-relative align-items-center">
                        <div className="row">
                            <div className="col-lg-8 d-flex flex-column justify-content-center pt-4 pt-lg-0 order-2 order-lg-1" data-aos="fade-up" data-aos-delay="200">
                                <h3 className='h3_regular'>A <span className='h3_semibold'>fully decentralized,</span> <span className='h3_medium'>blockchain-based</span> web application in which <span className='h3_semibold'>anyone can participate on</span> or create their own parimutuel betting pools.</h3>
                                <div className="d-flex justify-content-center justify-content-lg-start">
                                    {!wallet ? (
                                        <Button text="Connect" iconSrc={rocket} onClick={handleConnectWallet} backgroundColor="#6F75E5" />
                                    ) : (
                                        <>
                                            <NavLink to="/browsemarkets">
                                                <Button text="Browse markets" iconSrc={magnifying} style={{ width: "184px", marginRight: 20 }} onClick={() => { }} backgroundColor="#6F75E5" />
                                            </NavLink>
                                            <NavLink to="/createmarket">
                                                <Button text="Create a new market" iconSrc={artist_palette} onClick={() => { }} backgroundColor="#6F75E5" style={{width: "184px" ,padding: "10px 10px"}} />
                                            </NavLink>
                                        </>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </section >

                <MarketTabs categories={categories} myRef={marketTabsRef} />

                <EducationSection />

                <Footer />
            </div>
        </>
    )
}
