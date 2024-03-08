import React, { useEffect } from 'react'

import ContentLoader from "react-content-loader"

import { useStateContext } from '../contexts/ContextProvider';

import { ImageDisplay } from './ImageDisplay';

import upload from '../assets/img/image_upload.png';

export const OutcomeTable = () => {

    const { outcomeData, setOutcomeData } = useStateContext();
    const { outcomeOptionSelected, setOutcomeOptionSelected } = useStateContext();

    return (
        <>
            <table className="table table-hover text-center">
                <thead className="table-light head_table">
                    <tr>
                        <th className="col-2"></th>
                        <th className="col-3 text-start"></th>
                        <th className="col-1">Owned</th>
                        <th className="col-1">Share</th>
                        <th className="col-3">Average price</th>
                        <th className="col-3">Share payout</th>
                    </tr>
                </thead>
                <tbody>
                    {outcomeData.length === 0 ? (
                        <>
                            <tr>
                                <td colSpan="6" className="align-items-center align-middle text-center">
                                    <ContentLoader
                                        speed={2}
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 435 63"
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
                                        <rect x="1" y="1" rx="4" ry="4" width="25" height="25" />
                                        <rect x="220" y="11" rx="2" ry="2" width="30" height="5" />
                                        <rect x="257" y="88" rx="0" ry="0" width="1" height="2" />
                                        <rect x="371" y="11" rx="2" ry="2" width="63" height="5" />
                                        <rect x="297" y="11" rx="2" ry="2" width="63" height="5" />
                                        <rect x="32" y="11" rx="2" ry="2" width="180" height="5" />
                                        <rect x="257" y="11" rx="2" ry="2" width="30" height="5" />
                                        <rect x="258" y="54" rx="0" ry="0" width="1" height="2" />
                                        <rect x="1" y="34" rx="4" ry="4" width="25" height="25" />
                                        <rect x="220" y="44" rx="2" ry="2" width="30" height="5" />
                                        <rect x="371" y="44" rx="2" ry="2" width="63" height="5" />
                                        <rect x="297" y="44" rx="2" ry="2" width="63" height="5" />
                                        <rect x="32" y="44" rx="2" ry="2" width="180" height="5" />
                                        <rect x="257" y="44" rx="2" ry="2" width="30" height="5" />
                                    </ContentLoader>
                                </td>
                            </tr>
                        </>
                    ) : (
                        outcomeData.map((item, index) => (
                            <tr key={index} onClick={() => setOutcomeOptionSelected(item.outcome)} className='align-middle'>
                                {/*  TODO: preguntar si existe item.thumbnail y item.fullSize */}
                                {item.image ? (
                                    <td><ImageDisplay thumbnailUrl={item.image} /></td>
                                ):(
                                    <td><ImageDisplay thumbnailUrl={upload} /></td>
                                )}
                                <td scope="row" className='text-start'>{item.outcome}</td>
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
