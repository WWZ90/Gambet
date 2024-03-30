import React from 'react'

import { Link } from 'react-router-dom';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { truncateTextSize } from '../utils/services';

import imagePlaceholder from '../assets/img/slider/1.jpg';
import clock from '../assets/icons/png/ph_clock_2.png';

export const MarketBox = ({ market, i }) => {

    const settings = {
        dots: false,
        infinite: true,
        vertical: true,
        verticalSwiping: true,
        autoplay: true,
        autoplaySpeed: 1, 
        speed: 2000,
        slidesToShow: 1, 
        slidesToScroll: 1,
    };

    return (
        <Link key={i} className="market-box" to={`/market/id/${market.marketId}`}>
            <div className="market-box-inside">
                <div className="row">
                    <div className="market-box-header">
                        <div className="row">
                            <div className="col-3">
                                <div className='market-box-image'>
                                    {market.marketImage && market.marketImage.match(/\.(jpeg|jpg|gif|png)$/) !== null ? (
                                        <img src={market.marketImage}></img>
                                    ) : (
                                        <img src={imagePlaceholder}></img>
                                    )}
                                </div>
                            </div>
                            <div className="col-9 top-section body_4">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="market-box-section-name">
                                            World
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="market-box-date d-flex justify-content-end">
                                            <span><img src={clock} /></span>{market.deadline.split(", ")[0]}, {new Date(market.deadline).getFullYear()}
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
                                        <div className='d-flex justify-content-between align-content-center body_4 body_4_1'>
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
                    <div className="market-box-bottom body_4">
                        Shares: {market.totalShares}
                    </div>
                </div>
            </div>
        </Link>
    )
}
