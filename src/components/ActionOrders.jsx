import React, { useEffect, useState, useRef } from 'react'

import { motion } from "framer-motion";

import { useStateContext } from '../contexts/ContextProvider'
import { CenterModal } from './CenterModal';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { ToastContainer, toast } from 'react-toastify';
import ContentLoader from "react-content-loader"

import Dropdown from 'react-bootstrap/Dropdown';
import { Button } from './Button.jsx';

import 'react-toastify/dist/ReactToastify.css';
import { getMarket, fetchOrders, fillOrder } from "../utils/services.js";

import noto_money_bag from "../assets/icons/png/noto_heavy-dollar-sign.png";
import noto_dollar_banknote from "../assets/icons/png/noto_dollar-banknote.png";
import noto_shopping_cart from "../assets/icons/png/noto_shopping-cart.png";
import noto_heavy_dollar_sign from "../assets/icons/png/noto_heavy-dollar-sign.png";
import subtract from "../assets/icons/png/-.png";
import add from "../assets/icons/png/+.png";

import more from '../assets/icons/png/more.png';

export const ActionOrders = ({ loadDetailMarket }) => {

    const { activeOption, setActiveOption } = useStateContext(); //BUY or SELL
    const { limitPrice, setLimitPrice } = useStateContext();
    const { shares, setShares } = useStateContext();

    const { outcomeData, setOutcomeData } = useStateContext();
    const { outcomeOptionSelected, setOutcomeOptionSelected } = useStateContext();
    const { myOutcomeByMarket, setMyOutcomeByMarket } = useStateContext();

    const { cart, setCart } = useStateContext();
    const { cartCount, setCartCount } = useStateContext();
    const { idCartCounter, setIdCartCounter } = useStateContext();

    const { activeMarket } = useStateContext();
    const { marketId } = useStateContext();

    const { activeContract } = useStateContext();

    const { orders, setOrders } = useStateContext();

    const [shown, setShown] = useState(false);
    const [type, setType] = useState('Limit');      //Si es Limit o AMM

    const [maxCost, setMaxCost] = useState(0);      //Costo total del mercado
    const [myMaxCost, setMyMaxCost] = useState(0);  //Este es el costo de mi operacion

    const [newOrder, setNewOrder] = useState({
        outcome: '',
        price: 0.0,
        shares: 0,
        action: '',
    });

    const [showMenuM, setShowMenuM] = useState(false);
    const dropdownRef2 = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef2.current && !dropdownRef2.current.contains(event.target)) {
                setShowMenuM(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMouseEnter = () => {
        setShowMenuM(true);
    };

    const handleMouseLeave = () => {
        setShowMenuM(false);
    };

    const handleClick = () => {
        setShowMenuM(!showMenuM);
    };

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

    const handleIncrementLimitPrice = () => {
        setLimitPrice((Number(limitPrice) + 0.01).toFixed(3));
    };

    const handleDecrementLimitPrice = () => {
        if (limitPrice > 0) {
            setLimitPrice((Number(limitPrice) - 0.01).toFixed(3));
        }
    };

    const handleInputChangeLimitPrice = (e) => {

        const inputValue = e.target.value;
        if (inputValue.startsWith("0.") && !Number.isNaN(Number(inputValue))) {
            setLimitPrice(inputValue);
        }
    };

    const handleInputChangeShares = (e) => {
        const newValue = e.target.value;
        // Asegúrate de que solo se almacenen valores numéricos
        if (!isNaN(newValue)) {
            setShares(Number(newValue));
        }
    };

    const handleIncrementShares = () => {
        setShares(shares + 100);
    };

    const handleDecrementShares = () => {
        if (shares >= 100) {
            setShares(shares - 100);
        }
    };

    useEffect(() => {
        calculateMarketMaxCost('myMaxCost');
    }, [shares])

    useEffect(() => {
        if (outcomeData.length > 0) {
            calculateMarketMaxCost('maxCost');
        }
    }, [outcomeData])

    const calculateMarketMaxCost = (status) => {
        // Calcular maxCost del mercado
        const sumatoria = outcomeData.reduce((accumulator, currentValue) => {
            let shareValue;
            if (status === 'myMaxCost') {
                if (currentValue.outcome === outcomeOptionSelected)
                    shareValue = currentValue.share + shares;
                else
                    shareValue = currentValue.share;
            } else {
                shareValue = currentValue.share;
            }
            const squaredShareValue = Math.pow(shareValue, 2);
            return accumulator + squaredShareValue;
        }, 0);

        let result;
        if (status === 'myMaxCost') {
            result = (Math.sqrt(sumatoria) - maxCost).toFixed(2);
            setMyMaxCost(result);
        } else {
            result = Math.sqrt(sumatoria);
            setMaxCost(result);
        }
    }

    const addToCart = () => {
        // Nuevo elemento que deseas agregar al carrito
        const newCartItem = {
            id: idCartCounter,
            market: activeMarket.name,
            outcome: outcomeOptionSelected,
            price: limitPrice,
            shares: shares,
            action: activeOption, //BUY or SELL
        };

        const existingItem = cart.find(
            (item) =>
                item.outcome === newCartItem.outcome &&
                item.price === newCartItem.price &&
                item.action === newCartItem.action
        );

        if (existingItem) {
            // Si ya existe un elemento con las mismas propiedades, aumenta la cantidad de shares
            const updatedCart = cart.map((item) =>
                item === existingItem
                    ? { ...item, shares: item.shares + newCartItem.shares }
                    : item
            );

            // Actualiza el estado del carrito con el nuevo arreglo
            setCart(updatedCart);
        } else {
            // Si no existe un elemento con las mismas propiedades, agrega el nuevo elemento al carrito
            const updatedCart = [...cart, newCartItem];

            // Actualiza el estado del carrito con el nuevo arreglo
            setCart(updatedCart);
            setIdCartCounter(idCartCounter + 1);
            setCartCount(cartCount + 1);

            const badgeElement = document.querySelector('.badge');
            if (badgeElement) {
                badgeElement.style.animation = 'badgeBounce 0.5s ease'; // Aplicar la animación
                badgeElement.style.animationIterationCount = '1'; // Reproducción una vez

                // Restablecer la animación después de un breve período de tiempo
                setTimeout(() => {
                    badgeElement.style.animation = 'none';
                    badgeElement.style.animationIterationCount = '1';
                }, 500); // Cambia este valor para ajustar la duración de la animación
            }
        }

        toast.success('Add to cart!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
            style: {
                marginTop: '50px', // Margen de 100px desde la parte superior
            },
        });

    }

    useEffect(() => {
        console.log('Cantidad en el carrito: ' + cartCount);
        console.log(cart);
    }, [cart])

    const handleOrderExecution = () => {
        //fillOrder(activeContract, marketId, cart, orders).then(() => fetchOrders(true, activeContract, marketId).then(setOrders))

        const temp = {
            id: 0,
            market: activeMarket.name,
            outcome: outcomeOptionSelected,
            price: limitPrice,
            shares: shares,
            action: activeOption, //BUY or SELL
        };

        let orderToExecute = [];
        orderToExecute.push(temp);

        fillOrder(activeContract, marketId, orderToExecute, orders).then(() => {
            getMarket(marketId, activeContract).then(market => {
                loadDetailMarket(market);
            })
        })
    }

    return (
        <>
            <div className='box'>
                <div className='box_header'>
                    <div className="d-flex justify-align-content-between justify-content-lg-start">
                        <div className="button_switch_container d-flex">
                            <Button text="Buy" iconSrc={noto_heavy_dollar_sign} style={{ padding: "10px", width: "119px", height: "40px", backgroundColor: activeOption === 'BUY' ? '#EE8C71' : 'transparent', }} onClick={() => { setActiveOption('BUY') }} />
                            <Button text="Sell" iconSrc={noto_dollar_banknote} style={{ padding: "10px", width: "119px", height: "40px", backgroundColor: activeOption === 'SELL' ? '#EE8C71' : 'transparent', }} onClick={() => { setActiveOption('SELL') }} />
                        </div>
                        <div ref={dropdownRef2}>
                            <Dropdown
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onClick={handleClick}
                                show={showMenuM}
                            >
                                <Dropdown.Toggle id="dropdown-custom-components"
                                    className="dropdown-toggle">
                                    {type}
                                    <img src={more} alt="More Icon"
                                        className={`more-icon ${showMenuM ? 'rotate' : ''}`} />
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="dropdown-menu">
                                    <Dropdown.Item onClick={() => { setType('Limit') }}>
                                        <span>Limit</span>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={() => { setType('AMM') }}>
                                        <span>AMM</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                    {/* 
                    <div className="row">
                        <div className={`${activeOption == 'BUY' ? 'active buy' : 'buy'} col-2 text-center d-flex action`} onClick={() => { setActiveOption('BUY') }}>
                            <a>Buy</a>
                            <img src={noto_heavy_dollar_sign} className='icon' />
                        </div>
                        <div className={`${activeOption == 'SELL' ? 'active sell' : 'sell'} col-2 text-start d-flex action second`} onClick={() => { setActiveOption('SELL') }}>
                            <a>Sell</a>
                            <img src={noto_dollar_banknote} className='icon' />
                        </div>
                        <div className="col-4">

                            
                        <motion.div className="text-end dropdown"
                            onHoverStart={() => setShown(true)}
                            onHoverEnd={() => setShown(false)}
                        >
                            {type}
                            <motion.ul
                                variants={showMenu}
                                initial="exit"
                                animate={shown ? "enter" : "exit"}
                                className="dropdown-menu absolute"
                            >
                                <motion.li className="cursor-pointer my-auto">
                                    <a onClick={() => { setType('Limit') }}>Limit</a>
                                </motion.li>
                                <motion.li className="cursor-pointer my-auto">
                                    <a onClick={() => { setType('AMM') }}>AMM</a>
                                </motion.li>
                            </motion.ul>

                        </motion.div>
                       

                        </div>
                    </div>
                     */}
                </div>
                <div className='box_content'>

                    {outcomeData.length === 0 ? (
                        <ContentLoader
                            speed={2}
                            width="100%"
                            height="100%"
                            viewBox="0 0 154 25"
                            backgroundColor="#E0E0E0    "
                            foregroundColor="#ecebeb"
                        >
                            <rect x="518" y="191" rx="3" ry="3" width="88" height="6" />
                            <rect x="552" y="193" rx="3" ry="3" width="52" height="6" />
                            <rect x="436" y="294" rx="3" ry="3" width="410" height="6" />
                            <rect x="195" y="-55" rx="3" ry="3" width="380" height="6" />
                            <rect x="148" y="-105" rx="3" ry="3" width="178" height="6" />
                            <circle cx="583" cy="191" r="20" />
                            <rect x="258" y="21" rx="0" ry="0" width="1" height="2" />
                            <rect x="298" y="-95" rx="0" ry="0" width="21" height="6" />
                            <rect x="257" y="88" rx="0" ry="0" width="1" height="2" />
                            <rect x="1" y="2" rx="2" ry="2" width="150" height="5" />
                            <rect x="1" y="15" rx="2" ry="2" width="150" height="5" />
                        </ContentLoader>
                    ) : (
                        activeOption === 'BUY' ? (
                            <div className='d-flex flex-row flex-wrap'>
                                {outcomeData.map((option, index) => (
                                    <div key={index} className={`market_option ${outcomeOptionSelected == option.outcome ? 'active' : ''}`} onClick={() => setOutcomeOptionSelected(option.outcome)} label={option.outcome}>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <p>{option.outcome}</p>
                                            <p className='price'>${option.marketPrice}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='d-flex flex-row flex-wrap'>
                                {myOutcomeByMarket.length > 0 ? (
                                    myOutcomeByMarket.map((option, index) => (
                                        <div key={index} className={`market_option ${outcomeOptionSelected == option.outcome ? 'active' : ''}`} onClick={() => setOutcomeOptionSelected(option.outcome)} label={option.outcome}>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                <p>{option.outcome}</p>
                                                <p className='price'>${option.marketPrice}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <span className='text_gray'>You don't currently own any shares for this market</span>
                                )}

                            </div>
                        )
                    )}


                    {type == 'Limit' ? (
                        <>
                            <div className='inputData'>
                                <div className='d-flex'>
                                    <div className='inputDataTitle'>Limit Price</div>
                                    {/*
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip id="button-tooltip-2">Just numbers between 0 and 0.999. Use 0 for AMM</Tooltip>}
                                    >
                                        <i className="bi bi-info-circle pt-2 pl-2"></i>
                                    </OverlayTrigger>
                                    */}
                                </div>

                                <div className='inputStyle'>
                                    <OverlayTrigger
                                        overlay={<Tooltip id="tooltip-decrement">-1</Tooltip>}
                                        placement="top"
                                    >
                                        {/*
                                        <button className='buttonStyle short_button' disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleDecrementLimitPrice}>-</button>
                                        */}
                                        <Button cName="short-icon-button subtract" iconSrc={subtract} disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleDecrementLimitPrice} />
                                    </OverlayTrigger>
                                    <input
                                        type="text"
                                        className="form-control text-center text_gray"
                                        disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0}
                                        value={activeOption === 'SELL' && myOutcomeByMarket.length === 0 ? '0.' : limitPrice}
                                        style={{ flex: 1, border: 'none' }}
                                        onChange={handleInputChangeLimitPrice}
                                    />
                                    <OverlayTrigger
                                        overlay={<Tooltip id="tooltip-increment">+1</Tooltip>}
                                        placement="top"
                                    >
                                        {/*
                                        <button className='buttonStyle short_button' disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleIncrementLimitPrice}>+</button>
                                        */}
                                        <Button cName="short-icon-button add" iconSrc={add} disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleIncrementLimitPrice} />
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
                                        {/*
                                        <button className='buttonStyle short_button' disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleDecrementShares}>-</button>
                                        */}
                                        <Button cName="short-icon-button subtract" iconSrc={subtract} disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleDecrementShares} />
                                    </OverlayTrigger>
                                    <input
                                        type="text"
                                        className="form-control text-center text_gray"
                                        disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0}
                                        value={activeOption === 'SELL' && myOutcomeByMarket.length === 0 ? 0 : shares}
                                        style={{ flex: 1, border: 'none' }}
                                        onChange={handleInputChangeShares}
                                    />
                                    <OverlayTrigger
                                        overlay={<Tooltip id="tooltip-increment">+100</Tooltip>}
                                        placement="top"
                                    >
                                        {/*
                                        <button className='buttonStyle short_button' disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleIncrementShares}>+</button>
                                        */}
                                        <Button cName="short-icon-button add" iconSrc={add} disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleIncrementShares} />
                                    </OverlayTrigger>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='inputData'>
                            <div className='inputDataTitle'>Shares</div>
                            <div className='inputStyle'>
                                <OverlayTrigger
                                    overlay={<Tooltip id="tooltip-decrement">-1</Tooltip>}
                                    placement="top"
                                >
                                    {/*
                                    <button className='buttonStyle' disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleDecrementShares}>-</button>
                                    */}
                                    <Button cName="short-icon-button subtract" iconSrc={subtract} disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleDecrementShares} />
                                    
                                </OverlayTrigger>
                                <input
                                    type="text"
                                    className="form-control text-center"
                                    value={activeOption === 'SELL' && myOutcomeByMarket.length === 0 ? 0 : shares}
                                    disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0}
                                    style={{ flex: 1, border: 'none' }}
                                    onChange={handleInputChangeShares}
                                />
                                <OverlayTrigger
                                    overlay={<Tooltip id="tooltip-increment">+1</Tooltip>}
                                    placement="top"
                                >
                                    {/*
                                    <button className='buttonStyle' disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleIncrementShares}>+</button>
                                    */}
                                    <Button cName="short-icon-button add" iconSrc={add} disabled={activeOption === 'SELL' && myOutcomeByMarket.length === 0} onClick={handleIncrementShares} />
                                </OverlayTrigger>
                            </div>
                        </div>
                    )}

                    <div className='action_info text_gray'>
                        <div className='d-flex justify-content-between mb-1'>
                            <div className='fw-normal'>Max cost:</div>
                            <div className=''>{myMaxCost}</div>
                        </div>
                        <div className='d-flex justify-content-between mt-1 mb-1'>
                            <div className=''>Estimated shares:</div>
                            <div className=''>0.00</div>
                        </div>
                        <div className='d-flex justify-content-between mt-1 mb-1'>
                            <div className=''>Max profit:</div>
                            <div className=''>$0.00</div>
                        </div>
                        <div className='d-flex justify-content-between mt-1'>
                            <div className=''>Estimated fees (shares):</div>
                            <div className=''>$0.00</div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-5 buttons">
                        <Button cName="secundary" text="Add to cart" iconSrc={noto_shopping_cart} disabled={(activeOption === 'BUY' && shares === 0) || (activeOption === 'SELL' && (myOutcomeByMarket.length === 0 || shares === 0))} style={{ width: "133px", padding: "10px 16px" }} onClick={addToCart} />

                        {activeOption === 'BUY' ? (
                            <Button text="Buy now" iconSrc={noto_money_bag} disabled={shares <= 0} backgroundColor="#6F75E5" style={{ width: "133px", padding: "10px 16px" }} onClick={handleOrderExecution} />
                        ) : (
                            <Button text="Sell now" iconSrc={noto_money_bag} disabled={shares <= 0 || myOutcomeByMarket.length === 0} backgroundColor="#6F75E5" style={{ width: "133px", padding: "10px 16px" }} onClick={handleOrderExecution} />
                        )}

                    </div>

                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover={false}
                        theme="light"
                    />

                </div>
            </div >
        </>
    )
}


