import React, { useState, useEffect, useRef } from 'react'

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { Link } from 'react-router-dom';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { useStateContext } from '../contexts/ContextProvider';

import Image1 from '../assets/img/slider/1.jpg';

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
        autoplaySpeed: 4000, // Cambia el intervalo según tus preferencias
        speed: 1000,
        slidesToShow: 2, // Número de elementos visibles a la vez
        slidesToScroll: 2,
    };

    return (
        <>
            {wallet ? (
                <section className='market_tabs' ref={myRef}>
                    <div className="container">
                        <ul className="nav nav-tabs justify-content-center">
                            {categories.map((category) => (
                                <li
                                    key={category}
                                    className={`nav-item ${activeCategory === category ? 'active' : ''}`}
                                >
                                    <button
                                        className="nav-link"
                                        onClick={() => handleTabChange(category)}
                                    >
                                        {category}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {!marketsArray ? (
                            <>
                                <div className="container align-items-center text-center">
                                    <div className="lds-ripple"><div></div><div></div></div>
                                </div>
                            </>
                        ) : (
                            <div className="c-dhzjXW c-dhzjXW-iuYlq-css">
                                <div className='c-bQzyIt c-cYEHai'>
                                    {marketsArray?.map(function (item, i) {
                                        return <Link className="" to='/market/test'>
                                            <div className="c-dhzjXW c-cZDZbz c-dhzjXW-iQMpow-css mt-3">
                                                <div className='c-dhzjXW c-goxxzP'>
                                                    <div className="c-dhzjXW c-chvCSy">
                                                        <img src={Image1}></img>
                                                    </div>
                                                    <div className='c-dhzjXW c-hwskUZ'>
                                                        <div className="c-dhzjXW c-gURjzw">
                                                            <div className="c-dhzjXW c-jvuvAf">
                                                                <div className="c-dhzjXW c-dhzjXW-igIRObP-css">
                                                                    <p className='c-dqzIym c-dqzIym-fxyRaa-color-normal c-dqzIym-cTvRMP-spacing-normal c-dqzIym-jalaKP-weight-normal c-dqzIym-ickcwvy-css'>Deadline: 2023-12-30</p>
                                                                </div>
                                                            </div>
                                                            <div className="c-dhzjXW c-fGHEql">
                                                                <p className='c-dqzIym c-dqzIym-ojJRN-color-dark c-dqzIym-cTvRMP-spacing-normal c-dqzIym-eYAYgJ-weight-semi c-dqzIym-hzzdKO-size-md c-dqzIym-icCuRIN-css'>{item.name}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="c-dhzjXW c-gTTOYL">
                                                    <div className="c-dhzjXW c-dhzjXW-iimJBbq-css">

                                                        <div className='d-flex flex-row flex-wrap'>
                                                            <Slider {...settings}>
                                                                {outcomeData?.map((option, index) => (
                                                                    <div key={index} className="market_option">
                                                                        <div className='d-flex justify-content-between'>
                                                                            <p>{option.outcome}</p>
                                                                            <p className='price'>{option.marketPrice}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </Slider>
                                                        </div>

                                                    </div>
                                                </div>
                                                <hr className='c-jKkUoB' />
                                                <div className='c-dhzjXW c-jHpYkO'>
                                                    <span className='c-PJLV pt-2'>
                                                        Shares: {item.totalShares}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    })}
                                </div>
                            </div>
                        )}



                    </div>
                </section >
            ) : (
                <></>
            )}

        </>
    )
}
