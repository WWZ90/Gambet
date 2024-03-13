import React, { useState } from 'react'
import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'
import { Footer } from '../components/Footer'

import "./CreateMarketCarousel.css"
import { Button } from '../components/Button'

import pointing_left from "../assets/icons/png/noto_backhand-index-pointing-left.png";
import pointing_right from "../assets/icons/png/noto_backhand-index-pointing-right.png";

export const CreateMarketCarousel = () => {

    const [pageIndex, setPageIndex] = useState(1);

    const handlePrev = () => {
        if (pageIndex > 1)
            setPageIndex(pageIndex - 1);
    }

    const handleNext = () => {
        if (pageIndex < 7)
            setPageIndex(pageIndex + 1);
    }

    return (
        <>
            <NavBarWeb3Onboard />

            <div className="d-flex align-items-center justify-content-center create-market-carousel">
                <div className="text-center text-white carousel-form">
                    <div>

                        <div className="first">

                            <h5>What's your Market ID?</h5>
                            <p>Market ID is Lorem ipsum dolor sit amet consectetur. At rutrum scelerisque in justo purus posuere mauris. Sed ut posuere eu et. Cursus dictum risus massa sit nibh sed. </p>

                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <Button text='Back' onClick={handlePrev} style={{border: "2px solid #6E6EEA"}}/>
                        <Button text='Continue' onClick={handleNext} iconSrc={pointing_right} backgroundColor='#6E6EEA'/>
                    </div>
                    <div className="pages">
                        <a className={`${pageIndex == 1 ? 'active' : ''}`}>1</a>
                        <a className={`${pageIndex == 2 ? 'active' : ''}`}>2</a>
                        <a className={`${pageIndex == 3 ? 'active' : ''}`}>3</a>
                        <a className={`${pageIndex == 4 ? 'active' : ''}`}>4</a>
                        <a className={`${pageIndex == 5 ? 'active' : ''}`}>5</a>
                        <a className={`${pageIndex == 6 ? 'active' : ''}`}>6</a>
                        <a className={`${pageIndex == 7 ? 'active' : ''}`}>7</a>
                    </div>
                </div>

            </div>



            <Footer />
        </>
    )
}
