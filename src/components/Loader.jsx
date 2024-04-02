import React from 'react'

export const Loader = () => {
    return (
        <div className="container d-flex justify-content-center align-items-center text-center">
            <div className="lds-ripple">
                <div></div>
                <div></div>
            </div>
        </div>
    )
}
