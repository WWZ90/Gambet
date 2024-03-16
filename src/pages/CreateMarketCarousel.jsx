import React, { useState } from 'react'
import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'
import { Footer } from '../components/Footer'

import { Button } from '../components/Button'

import pointing_left from "../assets/icons/png/noto_backhand-index-pointing-left.png";
import pointing_right from "../assets/icons/png/noto_backhand-index-pointing-right.png";
import check from "../assets/icons/png/check.png";

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
                    <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                        {pageIndex > 1 ?
                            <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                            :
                            <></>
                        }
                        <Button text='Continue' iconSrc={pointing_right} backgroundColor='#6E6EEA' style={{ width: "184px" }} onClick={handleNext} />
                    </div>
                    <div className="pages">
                        <a className={`${pageIndex == 1 ? 'active' : ''}`}>
                            {pageIndex <= 1 ? "1" : <img src={check} />}
                        </a>
                        <a className={`${pageIndex == 2 ? 'active' : ''}`}>
                            {pageIndex <= 2 ? "2" : <img src={check} />}
                        </a>
                        <a className={`${pageIndex == 3 ? 'active' : ''}`}>
                            {pageIndex <= 3 ? "3" : <img src={check} />}
                        </a>
                        <a className={`${pageIndex == 4 ? 'active' : ''}`}>
                            {pageIndex <= 4 ? "4" : <img src={check} />}
                        </a>
                        <a className={`${pageIndex == 5 ? 'active' : ''}`}>
                            {pageIndex <= 5 ? "5" : <img src={check} />}
                        </a>
                        <a className={`${pageIndex == 6 ? 'active' : ''}`}>
                            {pageIndex <= 6 ? "6" : <img src={check} />}
                        </a>
                        <a className={`${pageIndex == 7 ? 'active' : ''}`}>
                            {pageIndex <= 7 ? "7" : <img src={check} />}
                        </a>
                    </div>
                </div>

            </div>



            <Footer />
        </>
    )
}
