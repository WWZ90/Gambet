import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'


// import required modules
import { Keyboard, Navigation, Autoplay } from 'swiper/modules';

import { useSetChain } from "@web3-onboard/react";

import { useStateContext } from '../contexts/ContextProvider'

import { NavBar } from '../components/NavBar'
import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'

import Image1 from '../assets/img/slider/1.jpg';
import heroLogo from '../assets/img/hero-img.png';

import { CardSwiperSlide } from '../components/CardSwiperSlide';

import { browseMarkets, truncateText } from '../utils/services';
import { delay } from 'framer-motion';

import AOS from 'aos';
import 'aos/dist/aos';

export const Home = () => {

    const { provider } = useStateContext();
    const { activeContract, setActiveContract } = useStateContext();
    const { marketsArray, setMarketsArray } = useStateContext();

    const [
        {
            chains, // the list of chains that web3-onboard was initialized with
            connectedChain, // the current chain the user's wallet is connected to
            settingChain // boolean indicating if the chain is in the process of being set
        },
        setChain // function to call to initiate user to switch chains in their wallet
    ] = useSetChain()

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
    }, [])

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: false,
        autoplaySpeed: 2000,
        nextArrow: (
            <div class="c-dhzjXW c-iBHQOu c-iBHQOu-fNKXAf-side-right slick-arrow slick-next" style="display: block;">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="c-fAcSzf" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.707 17.707L16.414 12 10.707 6.293 9.293 7.707 13.586 12 9.293 16.293z"></path>
                </svg>
            </div>
        ),
        prevArrow: (
            <div class="c-dhzjXW c-iBHQOu c-iBHQOu-bMZvXX-side-left slick-arrow slick-prev" style="display: block;">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="c-fAcSzf" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.293 6.293L7.586 12 13.293 17.707 14.707 16.293 10.414 12 14.707 7.707z"></path>
                </svg>
            </div>
        ),
    };


    return (
        <>
            <NavBarWeb3Onboard />

            <section className='slider_markets' id='hero'>

                {!marketsArray ? (
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 d-flex flex-column justify-content-center pt-4 pt-lg-0 order-2 order-lg-1" data-aos="fade-up" data-aos-delay="200">
                                <h1>Gambeth</h1>
                                <h2>A fully decentralized, blockchain-based web application in which anyone can participate on or create their own parimutuel betting pools.</h2>
                                <div className="d-flex justify-content-center justify-content-lg-start">
                                    <a href="#about" className="btn-get-started scrollto">Connect your wallet</a>
                                </div>
                            </div>
                            <div className="col-lg-6 order-1 order-lg-2 hero-img" data-aos="zoom-in" data-aos-delay="200">
                                <img src={heroLogo} className="img-fluid animated" alt="" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1>Bet on your beliefs</h1>
                        <Slider {...settings}>
                            {marketsArray.map(function (item, i) {
                                return <>
                                    <Link className="box_market" to='market/test'>
                                        <div className='market_img'>
                                            <img src={Image1}></img>
                                        </div>
                                        <div className="market_info">
                                            <div className='market_title'>{item.name}</div>
                                            <div className='market_desc'>Shares: {item.totalShares}</div>
                                        </div>
                                    </Link>
                                </>
                            })}
                        </Slider>
                    </>

                )}


            </section >
        </>
    )
}
