import React from 'react'

export const ImageDisplay = ({ thumbnailUrl, fullSizeUrl }) => {
    const handleClick = () => {
        window.open(fullSizeUrl, '_blank');
    };

    return (
        <div>
            <img src={thumbnailUrl} alt="Thumbnail" onClick={handleClick} style={{ cursor: 'pointer', width: '30px' }} />
        </div>
    )
}
