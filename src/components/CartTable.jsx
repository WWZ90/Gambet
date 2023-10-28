import React from 'react'

export const CartTable = ({ cart, action, removeFromCart }) => {
    const filteredCart = cart.filter((item) => item.action === action);

    return (
        <>
            <h4 className='text-center mt-5'>{action === 'BUY' ? 'Placed Bids' : 'Placed Asks'}</h4>
            <p className='text-center'>{action === 'BUY' ? 'Max cost: 0.00' : 'Market pay: 0.00'}</p>
            <table className="table table-hover">
                <thead>
                    <tr>
                        {action === 'BUY' &&
                            <>
                                <th className='col-8'>Outcome</th>
                                <th className='col-1'>Price</th>
                                <th className='col-1'>Shares</th>
                                <th className='col-1'>Payout</th>
                                <th className='col-1'>Action</th>
                            </>
                        }
                        {action === 'SELL' &&
                            <>
                                <th className='col-9'>Outcome</th>
                                <th className='col-1'>Price</th>
                                <th className='col-1'>Shares</th>
                                <th className='col-1'>Action</th>
                            </>
                        }
                    </tr>
                </thead>
                <tbody>
                    {filteredCart.map((item, index) => (
                        <tr key={index}>
                            <td>{item.outcome}</td>
                            <td>{item.shares}</td>
                            <td>{item.price}</td>
                            {action === 'BUY' && <td>0</td>}
                            <td>
                                <i className="bi bi-trash3-fill" onClick={() => removeFromCart(item.id)}></i>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
