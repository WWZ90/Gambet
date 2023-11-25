import React from 'react'

export const CartTable = ({ cart, action, removeFromCart }) => {

    const filteredCart = cart.filter((item) => item.action === action);

    return (
        <>
            <h4 className='text-center mt-5 text_yellow'>
                {action === 'BUY' ? (
                    <>
                        Placed <span className="bids-text">Bids</span>
                    </>
                ) : (
                    <>
                        Placed <span className="asks-text">Asks</span>
                    </>
                )}
            </h4>
            <p className='text-center text_white'>{action === 'BUY' ? 'Max cost: 0.00' : 'Market pay: 0.00'}</p>
            <table className="table table-hover">
                <thead>
                    <tr>
                        {action === 'BUY' &&
                            <>
                                <th className='col-4'>Market</th>
                                <th className='col-4'>Outcome</th>
                                <th className='col-1 text-center'>Price</th>
                                <th className='col-1 text-center'>Shares</th>
                                <th className='col-1 text-center'>Payout</th>
                                <th className='col-1 text-center'>Action</th>
                            </>
                        }
                        {action === 'SELL' &&
                            <>
                                <th className='col-4'>Market</th>
                                <th className='col-4'>Outcome</th>
                                <th className='col-1 text-center'>Price</th>
                                <th className='col-1 text-center'>Shares</th>
                                <th className='col-1 text-end'></th>
                                <th className='col-1 text-end'>Action</th>
                            </>
                        }
                    </tr>
                </thead>
                <tbody>
                    {filteredCart.map((item, index) => (
                        <tr key={index} className='align-middle'>
                            <td>{item.market}</td>
                            <td>{item.outcome}</td>
                            <td className='text-center'>{item.price}</td>
                            <td className='text-center'>{item.shares}</td>
                            {action === 'BUY' ? (<td className='text-center'>0</td>):(<td className='text-center'></td>) }
                            <td className='text-center'>
                                <i className="bi bi-trash3-fill" onClick={() => removeFromCart(item.id)}></i>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
