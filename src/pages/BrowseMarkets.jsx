import React, { useEffect, useState } from 'react';

import { useConnectWallet } from '@web3-onboard/react'

import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'

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

import Image1 from '../assets/img/slider/1.jpg';
import heroLogo from '../assets/img/hero-img.png';

import { CardSwiperSlide } from '../components/CardSwiperSlide';

import { browseMarkets, truncateText } from '../utils/services';
import { delay } from 'framer-motion';
import { Footer } from '../components/Footer';

export const BrowseMarkets = () => {

  const [{ wallet }] = useConnectWallet();

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
      return await browseMarkets(activeContract);
    }

    if (activeContract)
      getMarkets().then(result => {
        setMarketsArray(result);
      });

  }, [activeContract])

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: false,
    autoplaySpeed: 2000,
    nextArrow: (
      <div className="c-dhzjXW c-iBHQOu c-iBHQOu-fNKXAf-side-right slick-arrow slick-next" style="display: block;">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="c-fAcSzf" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 17.707L16.414 12 10.707 6.293 9.293 7.707 13.586 12 9.293 16.293z"></path>
        </svg>
      </div>
    ),
    prevArrow: (
      <div className="c-dhzjXW c-iBHQOu c-iBHQOu-bMZvXX-side-left slick-arrow slick-prev" style="display: block;">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="c-fAcSzf" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.293 6.293L7.586 12 13.293 17.707 14.707 16.293 10.414 12 14.707 7.707z"></path>
        </svg>
      </div>
    ),
  };


  return (
    <>
      <NavBarWeb3Onboard />

      <section className='browseMarket'>
        {!marketsArray ? (
          <>
            <div className="container align-items-center text-center">
              <div className="lds-ripple"><div></div><div></div></div>
            </div>
          </>
        ) : (
          <>
            <h1>Bet on your beliefs</h1>
            <Slider {...settings}>
              {marketsArray.map(function (item, i) {
                return <Link key={item.name} className="box_market" to='/market/test'>
                  <div className='market_img'>
                    <img src={Image1}></img>
                  </div>
                  <div className="market_info">
                    <div className='market_title'>{item.name}</div>
                    <div className='market_desc'>Shares: {item.totalShares}</div>
                  </div>
                </Link>

              })}
            </Slider>
          </>
        )}
      </section>

      <Footer />
    </>
  )
}
