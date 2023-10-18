import React from 'react'

import Image1 from '../assets/img/slider/1.jpg';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

export const CardSwiperSlide = ({ title, shares }) => {
    return (
        <SwiperSlide>
            <div>
                <div className='market_img'>
                    <img src={Image1}></img>
                </div>
                <div className="market_info">
                    <div className='market_title'>Argentina 2023 Presidential Elections</div>
                    <div className='market_desc'>1251 shares</div>
                </div>
            </div>
        </SwiperSlide>

    )
}



