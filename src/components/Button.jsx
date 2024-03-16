import React from 'react'

export const Button = ({ cName, text, iconSrc, style, backgroundColor, disabled, alt, onClick }) => {
  const buttonStyle = {
    backgroundColor: backgroundColor || 'transparent !important',
    ...style, 
  };

  const classNames = `icon-button ${cName || ''}`.trim();

  return (
    <button className={classNames} disabled={disabled} style={buttonStyle} onClick={onClick}>
      <span>{text}</span>
      <img src={iconSrc} alt={alt} />
    </button>
  )
}
