import React, { useEffect, useState } from 'react'

import { motion } from "framer-motion";

import { useStateContext } from '../contexts/ContextProvider'
import { CenterModal } from './CenterModal';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

export const ActionOrders = () => {

    const { activeOption, setActiveOption } = useStateContext(); //BUY or SELL
    const { limitPrice, setLimitPrice } = useStateContext();
    const { shares, setShares } = useStateContext();
    const { amount, setAmount } = useStateContext();
    const { showModalMarket, setShowModalMarket } = useStateContext();

    const { outcomeData, setOutcomeData } = useStateContext();
    const { outcomeOptionSelected, setOutcomeOptionSelected } = useStateContext();
    const { myOutcomeByMarket, setMyOutcomeByMarket } = useStateContext();

    const { cart, setCart } = useStateContext();
    const { cartCount, setCartCount } = useStateContext();
    const { idCartCounter, setIdCartCounter } = useStateContext();

    const { activeMarket } = useStateContext();


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


    const [newOrder, setNewOrder] = useState({
        outcome: '',
        price: 0.0,
        shares: 0,
        action: '',
    });

    const addToCart = () => {

        console.log('Outcome: ' + outcomeOptionSelected);
        // Nuevo elemento que deseas agregar al carrito
        const newCartItem = {
            id: idCartCounter,
            market: activeMarket,
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
        console.log('Carrito: ' + JSON.stringify(cart));
    }, [cart])


    return (
        <>
            <div className='box'>
                <div className='box_header'>
                    <div className="row">
                        <div className="col-2 text-center">
                            <a className={`${activeOption == 'BUY' ? 'active buy' : ''}`} onClick={() => { setActiveOption('BUY') }}>Buy</a>
                        </div>
                        <div className="col-2 text-start p-0">
                            <a className={`${activeOption == 'SELL' ? 'active sell' : ''}`} onClick={() => { setActiveOption('SELL') }}>Sell</a>
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

                    {activeOption === 'BUY' ? (
                        <div className='d-flex flex-row flex-wrap'>
                            {outcomeData.map((option, index) => (
                                <div key={index} className={`market_option ${outcomeOptionSelected == option.outcome ? 'active' : ''}`} onClick={() => setOutcomeOptionSelected(option.outcome)} label={option.outcome}>
                                    <div className='d-flex justify-content-between'>
                                        <p>{option.outcome}</p>
                                        <p className='price'>${option.marketPrice}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='d-flex flex-row flex-wrap'>
                            {myOutcomeByMarket.map((option, index) => (
                                <div key={index} className={`market_option ${outcomeOptionSelected == option.outcome ? 'active' : ''}`} onClick={() => setOutcomeOptionSelected(option.outcome)} label={option.outcome}>
                                    <div className='d-flex justify-content-between'>
                                        <p>{option.outcome}</p>
                                        <p className='price'>{option.marketPrice}</p>
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
                                    <button className='buttonStyle' onClick={handleDecrementShares}>-</button>
                                </OverlayTrigger>
                                <input
                                    type="text"
                                    className="form-control text-center"
                                    value={amount}
                                    style={{ flex: 1, border: 'none' }}
                                    onChange={handleInputChangeShares}
                                />
                                <OverlayTrigger
                                    overlay={<Tooltip id="tooltip-increment">+1</Tooltip>}
                                    placement="top"
                                >
                                    <button className='buttonStyle' onClick={handleIncrementShares}>+</button>
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

                    {activeOption === 'BUY' ? (
                        <button className='button addButton'>Buy Now</button>
                    ) : (
                        <button className='button sellButton'>Sell Now</button>
                    )}

                    <button className='button addToCartButton' onClick={addToCart}>Add to Cart</button>

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
            </div>
        </>
    )
}
