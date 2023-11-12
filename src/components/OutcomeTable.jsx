import React, { useEffect } from 'react'

import { useStateContext } from '../contexts/ContextProvider';

import upload from '../assets/img/upload.png';
import { ImageDisplay } from './ImageDisplay';

export const OutcomeTable = () => {

    const { outcomeData, setOutcomeData } = useStateContext();
    const { outcomeOptionSelected, setOutcomeOptionSelected } = useStateContext();

    return (
        <>
            <table className="table table-hover text-center">
                <thead className="table-light">
                    <tr>
                        <th className="col-1">Image</th>
                        <th className="col-5">Outcome</th>
                        <th className="col-1">Owned</th>
                        <th className="col-1">Share</th>
                        <th className="col-2">Average price</th>
                        <th className="col-2">Share payout</th>
                    </tr>
                </thead>
                <tbody>
                    {!outcomeData ? (
                        <>
                            <tr>
                                <td colspan="5" className="align-items-center align-middle text-center">
                                    <div className="lds-ripple"><div></div><div></div></div>
                                </td>
                            </tr>
                        </>
                    ) : (
                        outcomeData.map((item, index) => (
                            <tr key={index} onClick={() => setOutcomeOptionSelected(item.outcome)} className='align-middle'>
                                {/*  TODO: preguntar si existe item.thumbnail y item.fullSize */}
                                <th><ImageDisplay thumbnailUrl={upload}/></th>
                                <th scope="row">{item.outcome}</th>
                                <td>{item.owned}</td>
                                <td>{item.share}</td>
                                {item.averagePrice != '-' ? (
                                    <td>${item.averagePrice}</td>
                                ) : (
                                    <td>{item.averagePrice}</td>
                                )}

                                <td>${item.sharePayout}</td>
                            </tr>
                        ))

                    )}


                </tbody>
            </table>
        </>
    )
}
