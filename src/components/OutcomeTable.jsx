import React, { useEffect } from 'react'

import { useStateContext } from '../contexts/ContextProvider';

export const OutcomeTable = () => {

    const { outcomeData, setOutcomeData } = useStateContext();
    const { outcomeOptionSelected, setOutcomeOptionSelected } = useStateContext();

    return (
        <>
            <table className="table table-hover text-center">
                <thead className="table-light">
                    <tr>
                        <th scope="col-4">Outcome</th>
                        <th scope="col-2">Owned</th>
                        <th scope="col-2">Share</th>
                        <th scope="col-2">Average price</th>
                        <th scope="col-2">Share payout</th>
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
                            <tr key={index} onClick={() => setOutcomeOptionSelected(item.outcome)}>
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
