import React, { useEffect, useState } from 'react'

import { motion } from "framer-motion";

import { useStateContext } from '../contexts/ContextProvider'
import { CenterModal } from './CenterModal';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export const ActionOrders = () => {

    const { activeOption, setActiveOption } = useStateContext(); //Buy or sell
    const { limitPrice, setLimitPrice } = useStateContext();
    const { shares, setShares } = useStateContext();
    const { amount, setAmount } = useStateContext();
    const { showModalMarket, setShowModalMarket } = useStateContext();

    const { optionActive } = useStateContext(); //Control de si tiene seleccionado en Orders o My Orders
    const { marketOptionSelected, setMarketOptionSelected } = useStateContext();

    const [shown, setShown] = useState(false);
    const [type, setType] = useState('limit'); //Si es Limit o AMM

    const showMenu = {
        enter: {
            opacity: 1,
            top: -20,
            y: 0,
            display: "block",
            position: "absolute",
            cursor: "pointer"
        },
        exit: {
            y: -10,
            opacity: 0,
            transition: {
                duration: 0.1,
            },
            transitionEnd: {
                display: "none",
                position: "absolute",
                cursor: "pointer"
            },
        },
    };

    const handleClose = (type) => {
        setShowModalMarket(false);
    }

    const handleShow = (type) => {
        setShowModalMarket(true);
    }

    const handleIncrementLimitPrice = () => {
        setLimitPrice(limitPrice + 1);
    };

    const handleDecrementLimitPrice = () => {
        if (limitPrice > 0) {
            setLimitPrice(limitPrice - 1);
        }
    };

    const handleIncrementShares = () => {
        console.log(shares);
        setShares(shares + 100);
    };

    const handleDecrementShares = () => {
        if (shares >= 100) {
            setShares(shares - 100);
        }
    };

    const handleIncrementAmount = () => {
        setAmount(amount + 1);
    };

    const handleDecrementAmount = () => {
        if (amount > 0) {
            setAmount(amount - 1);
        }
    };

    const handleInputChangeLimitPrice = (e) => {
        const newValue = e.target.value;
        // Asegúrate de que solo se almacenen valores numéricos
        if (!isNaN(newValue)) {
            setLimitPrice(Number(newValue));
        }
    };

    const handleInputChangeShares = (e) => {
        const newValue = e.target.value;
        // Asegúrate de que solo se almacenen valores numéricos
        if (!isNaN(newValue)) {
            setShares(Number(newValue));
        }
    };

    const handleInputChangeAmount = (e) => {
        const newValue = e.target.value;
        // Asegúrate de que solo se almacenen valores numéricos
        if (!isNaN(newValue)) {
            setAmount(Number(newValue));
        }
    };

    let marketOptions = [
        { name: 'Sergio Massa', price: '$0.514' },
        { name: 'Patricia Bullrich', price: '$0.514' },
        { name: 'Javier Milei', price: '$0.114' },
        { name: 'Tiebreaker', price: '$0.723' },
        { name: 'Other candidate', price: '$0.002' },
    ];

    let myMarketOptions = [
        { name: 'Patricia Bullrich', price: '$0.514' },
        { name: 'Tiebreaker', price: '$0.723' },
        { name: 'Other candidate', price: '$0.002' },
    ];

    useEffect(() => {
        setMarketOptionSelected(marketOptions[0].name)
    }, [])


    return (
        <>
            <div className='box'>
                <div className='box_header'>
                    <div className="row">
                        <div className="col-2 text-center">
                            <a className={`${activeOption == 'buy' ? 'active buy' : ''}`} onClick={() => { setActiveOption('buy') }}>Buy</a>
                        </div>
                        <div className="col-2 text-start p-0">
                            <a className={`${activeOption == 'sell' ? 'active sell' : ''}`} onClick={() => { setActiveOption('sell') }}>Sell</a>
                        </div>
                        <motion.div className="col-7 text-end dropdown"
                            onHoverStart={() => setShown(true)}
                            onHoverEnd={() => setShown(false)}
                        >
                            Limit
                            <motion.ul
                                variants={showMenu}
                                initial="exit"
                                animate={shown ? "enter" : "exit"}
                                className="dropdown-menu absolute"
                            >
                                <motion.li className="cursor-pointer my-auto">
                                    <a onClick={() => { setType('limit') }}>Limit</a>
                                </motion.li>
                                <motion.li className="cursor-pointer my-auto">
                                    <a onClick={() => { setType('amm') }}>AMM</a>
                                </motion.li>
                            </motion.ul>

                        </motion.div>
                    </div>
                </div>
                <div className='box_content'>

                    {optionActive === 'orders' ? (
                        <div className='d-flex flex-row flex-wrap'>
                            {marketOptions.map((option, index) => (
                                <div key={index} className={`market_option ${marketOptionSelected == option.name ? 'active' : ''}`} onClick={() => setMarketOptionSelected(option.name)} label={option.name}>
                                    <div className='d-flex justify-content-between'>
                                        <p>{option.name}</p>
                                        <p className='price'>{option.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='d-flex flex-row flex-wrap'>
                            {myMarketOptions.map((option, index) => (
                                <div key={index} className={`market_option ${marketOptionSelected == option.name ? 'active' : ''}`} onClick={() => setMarketOptionSelected(option.name)} label={option.name}>
                                    <div className='d-flex justify-content-between'>
                                        <p>{option.name}</p>
                                        <p className='price'>{option.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}




                    {type == 'limit' ? (
                        <>
                            <div className='inputData'>
                                <div className='inputDataTitle'>Limit Price</div>
                                <div className='inputStyle'>
                                    <OverlayTrigger
                                        overlay={<Tooltip id="tooltip-decrement">-1</Tooltip>}
                                        placement="top"
                                    >
                                        <button className='buttonStyle' onClick={handleDecrementLimitPrice}>-</button>
                                    </OverlayTrigger>
                                    <input
                                        type="text"
                                        className="form-control text-center"
                                        value={limitPrice}
                                        style={{ flex: 1, border: 'none' }}
                                        onChange={handleInputChangeLimitPrice}
                                    />
                                    <OverlayTrigger
                                        overlay={<Tooltip id="tooltip-increment">+1</Tooltip>}
                                        placement="top"
                                    >
                                        <button className='buttonStyle' onClick={handleIncrementLimitPrice}>+</button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <div className='inputData'>
                                <div className='inputDataTitle'>Shares</div>
                                <div className='inputStyle'>
                                    <OverlayTrigger
                                        overlay={<Tooltip id="tooltip-decrement">-100</Tooltip>}
                                        placement="top"
                                    >
                                        <button className='buttonStyle' onClick={handleDecrementShares}>-</button>
                                    </OverlayTrigger>
                                    <input
                                        type="text"
                                        className="form-control text-center"
                                        value={shares}
                                        style={{ flex: 1, border: 'none' }}
                                        onChange={handleInputChangeShares}
                                    />
                                    <OverlayTrigger
                                        overlay={<Tooltip id="tooltip-increment">+100</Tooltip>}
                                        placement="top"
                                    >
                                        <button className='buttonStyle' onClick={handleIncrementShares}>+</button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='inputData'>
                            <div className='inputDataTitle'>Amount</div>
                            <div className='inputStyle'>
                                <OverlayTrigger
                                    overlay={<Tooltip id="tooltip-decrement">-1</Tooltip>}
                                    placement="top"
                                >
                                    <button className='buttonStyle' onClick={handleDecrementAmount}>-</button>
                                </OverlayTrigger>
                                <input
                                    type="text"
                                    className="form-control text-center"
                                    value={amount}
                                    style={{ flex: 1, border: 'none' }}
                                    onChange={handleInputChangeAmount}
                                />
                                <OverlayTrigger
                                    overlay={<Tooltip id="tooltip-increment">+1</Tooltip>}
                                    placement="top"
                                >
                                    <button className='buttonStyle' onClick={handleIncrementAmount}>+</button>
                                </OverlayTrigger>
                            </div>
                        </div>
                    )}

                    <div className='action_info'>
                        <div className='d-flex justify-content-between mt-3 mb-2'>
                            <div className=''>Average price:</div>
                            <div className=''>$0.00</div>
                        </div>
                        <div className='d-flex justify-content-between mt-2 mb-2'>
                            <div className=''>Estimated shares:</div>
                            <div className=''>0.00</div>
                        </div>
                        <div className='d-flex justify-content-between mt-2 mb-2'>
                            <div className=''>Max profit:</div>
                            <div className=''>$0.00</div>
                        </div>
                        <div className='d-flex justify-content-between mt-2'>
                            <div className=''>Estimated fees (shares):</div>
                            <div className=''>$0.00</div>
                        </div>
                    </div>


                    <button className='addButton'>Add</button>

                </div>
            </div>
        </>
    )
}
