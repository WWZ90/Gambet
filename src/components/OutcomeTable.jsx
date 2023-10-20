import React, { useEffect } from 'react'

import { useStateContext } from '../contexts/ContextProvider';

export const OutcomeTable = () => {

    const { outcomeData, setOutcomeData } = useStateContext();
    const { marketOptionSelected, setMarketOptionSelected } = useStateContext();

    useEffect(() => {

        // Datos en un array
        const data = [
            {
                outcome: 'Sergio Massa',
                owned: 40,
                total: 354,
                marketPrice: '$0.514',
                averagePrice: '$0.491',
                sharePayout: '$1.948',
            },
            {
                outcome: 'Patricia Bullrich',
                owned: 40,
                total: 100,
                marketPrice: '$0.514',
                averagePrice: '-',
                sharePayout: '$6.897',
            },
            {
                outcome: 'Javier Milei',
                owned: 0,
                total: 300,
                marketPrice: '$0.114',
                averagePrice: '-',
                sharePayout: '$2.948',
            },
            {
                outcome: 'Tiebreaker',
                owned: 0,
                total: 500,
                marketPrice: '$0.723',
                averagePrice: '-',
                sharePayout: '$1.948',
            },
            {
                outcome: 'Other candidate',
                owned: 0,
                total: 1,
                marketPrice: '$0.002',
                averagePrice: '-',
                sharePayout: '$689.432',
            },
        ];

        setOutcomeData(data);

    }, [])


    return (
        <>
            <table className="table table-hover text-center">
                <thead className="table-light">
                    <tr>
                        <th scope="col-4">Outcome</th>
                        <th scope="col-2">Owned</th>
                        <th scope="col-2">Total</th>
                        <th scope="col-2">Average price</th>
                        <th scope="col-2">Share payout</th>
                    </tr>
                </thead>
                <tbody>
                    {outcomeData?.map((item, index) => (
                        <tr key={index} onClick={()=>setMarketOptionSelected(item.outcome)}>
                            <th scope="row">{item.outcome}</th>
                            <td>{item.owned}</td>
                            <td>{item.total}</td>
                            <td>{item.averagePrice}</td>
                            <td>{item.sharePayout}</td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </>
    )
}
