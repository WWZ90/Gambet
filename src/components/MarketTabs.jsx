import React, { useState, useEffect, useRef } from 'react'

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { Link } from 'react-router-dom';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { useStateContext } from '../contexts/ContextProvider';

import { truncateTextSize } from '../utils/services';

import Image1 from '../assets/img/slider/1.jpg';
import clock from '../assets/icons/png/ph_clock.png';
import { Button } from './Button';

export const MarketTabs = ({ categories, myRef }) => {

    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

    const { marketsArray, setMarketsArray } = useStateContext();
    const { outcomeData, setOutcomeData } = useStateContext();
    const { outcomeOptionSelected, setOutcomeOptionSelected } = useStateContext();

    const [activeCategory, setActiveCategory] = useState(categories[0]); // Inicialmente, muestra la primera categoría

    const handleTabChange = (category) => {
        setActiveCategory(category);
    };

    const settings = {
        dots: false,
        infinite: true,
        vertical: true,
        verticalSwiping: true,
        autoplay: true,
        autoplaySpeed: 1, // Cambia el intervalo según tus preferencias
        speed: 2000,
        slidesToShow: 1, // Número de elementos visibles a la vez
        slidesToScroll: 1,
    };

    return (
        <>
            <section className='market_tabs' ref={myRef}>
                <div className="container">
                    <ul className="nav nav-tabs justify-content-center">
                        {categories.map((category) => (
                            <li
                                key={category}
                                className={`nav-item ${activeCategory === category ? 'active' : ''}`}
                            >
                                <Button text={category} cName="terciary nav-link" onClick={() => handleTabChange(category)} />
                            </li>
                        ))}
                    </ul>

                    {!marketsArray ? (
                        <>
                            <div className="container align-items-center text-center">
                                <div className="lds-ripple">
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='markets-box d-flex'>
                                {marketsArray?.map(function (market, i) {
                                    return <Link key={i} className="market-box" to={`/market/id/${market.marketId}`}>
                                        <div className="market-box-inside">
                                            <div className="row">
                                                <div className="market-box-header">


                                                    <div className="row">
                                                        <div className="col-3">
                                                            <div className='market-box-image'>
                                                                {market.marketImage && market.marketImage.match(/\.(jpeg|jpg|gif|png)$/) !== null ? (
                                                                    <img src={market.marketImage}></img>
                                                                ) : (
                                                                    <img src={Image1}></img>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-9 top-section">
                                                            <div className="row">
                                                                <div className="col-4">
                                                                    <div className="market-box-section-name">
                                                                        Word
                                                                    </div>
                                                                </div>
                                                                <div className="col-8">
                                                                    <div className="market-box-date">
                                                                        <span><img src={clock}/></span>{market.deadline.split(", ")[0]}, {new Date(market.deadline).getFullYear()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="market-box-name">
                                                                    {truncateTextSize(market.name, 40)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="market-box-middle">
                                                    <div className='d-flex flex-row flex-wrap'>
                                                        <Slider {...settings}>
                                                            {market.outcomes?.map((outcome, outcomeIndex) => (
                                                                <div key={outcomeIndex} className="market_option">
                                                                    <div className='d-flex justify-content-between'>
                                                                        <p>{truncateTextSize(outcome, 27)}</p>
                                                                        <p className='price'>${market.prices[outcomeIndex].toFixed(3)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </Slider>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="market-box-bottom">
                                                    Shares: {market.totalShares}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                })}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </>
    )
}
