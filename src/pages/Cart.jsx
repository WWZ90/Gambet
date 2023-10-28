import React, { useState } from 'react'
import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'
import { Footer } from '../components/Footer'

import { useStateContext } from '../contexts/ContextProvider'
import { CartTable } from '../components/CartTable'

export const Cart = () => {

    const { cart, setCart } = useStateContext();
    const { cartCount, setCartCount } = useStateContext();

    const removeFromCart = (id) => {
        const updatedCart = cart.filter((item) => item.id !== id);
        setCart(updatedCart);
        setCartCount(cartCount - 1);
    };

    return (
        <>
            <NavBarWeb3Onboard />

            <section className='cart'>
                <div className="container">
                    <div className="cart_table bids">
                        <CartTable cart={cart} action="BUY" removeFromCart={removeFromCart} />
                    </div>
                    <div className="cart_table asks">
                        <CartTable cart={cart} action="SELL" removeFromCart={removeFromCart} />
                    </div>
                    <button className='button'>Complete orders</button>
                </div>
            </section>



            <Footer />
        </>
    )
}
