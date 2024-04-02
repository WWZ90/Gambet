import React, { useState, useEffect, useRef } from 'react'

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { useStateContext } from '../contexts/ContextProvider';

import { Button } from './Button';
import { MarketBox } from './MarketBox';
import { Loader } from './Loader';

export const MarketTabs = ({ categories, myRef }) => {

    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

    const { marketsArray, setMarketsArray } = useStateContext();

    const [activeCategory, setActiveCategory] = useState(categories[0]); // Inicialmente, muestra la primera categoría

    const handleTabChange = (category) => {
        setActiveCategory(category);
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
                    <div className='markets-box d-flex'>
                        {!marketsArray ? (
                            <Loader />
                        ) : (
                            <>
                                {marketsArray?.map(function (market, i) {
                                    return MarketBox({ market, i })
                                })}

                            </>
                        )}
                    </div>
                </div>
            </section >
        </>
    )
}
