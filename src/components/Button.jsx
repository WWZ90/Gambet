import React from 'react'

export const Button = ({ text, iconSrc, style, backgroundColor, disabled, alt, onClick }) => {
  const buttonStyle = {
    backgroundColor: backgroundColor || 'transparent',
    ...style, 
  };

  return (
    <button className="icon-button" disabled={disabled} style={buttonStyle} onClick={onClick}>
      <span>{text}</span>
      <img src={iconSrc} alt={alt} />
    </button>
  )
}
