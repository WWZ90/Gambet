import React from 'react'

export const Button = ({ text, iconSrc, style, backgroundColor, alt, onClick }) => {
  const buttonStyle = {
    backgroundColor: backgroundColor || 'transparent',
    ...style, 
  };
  return (
    <button className="icon-button" style={buttonStyle} onClick={onClick}>
      <span>{text}</span>
      <img src={iconSrc} alt={alt} />
    </button>
  )
}
