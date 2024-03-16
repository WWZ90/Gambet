import React from 'react'

import { NavLink, useNavigate } from "react-router-dom";

import { Button } from './Button';

import logo_large_cut from '../assets/img/gambeth-logo-large-cut.png';
import pointing_right from '../assets/icons/png/noto_backhand-index-pointing-right.png';
import technologist from '../assets/icons/png/noto_technologist-light-skin-tone.png';
import cryptocurrency_market_growth from '../assets/icons/png/cryptocurrency market growth.png';
import money_and_phone from '../assets/icons/png/money and phone.png';

export const EducationSection = () => {
    return (
        <section className='education'>
            <div className="row">
                <div className="col-6">
                    <div className="d-flex">
                        <div className="">
                            <img src={logo_large_cut} />
                        </div>
                        <div className="education-left-text">
                            <div className="education-left-tittle">
                                <span>Gambeth</span> Education</div>
                            <div className="education-left-body">Tutorials, dynamic content, and personalized assessments will help you get started with Gambeth. Learn more <span><img src={pointing_right} /></span></div>
                            <div className="education-left-body">or go to Gambeth Education page!</div>
                            <NavLink to="/education">
                                <Button text="Read more!" cName="secundary" style={{width: "184px", padding: "10px"}}/>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="d-flex educations-box justify-content-evenly">
                        <div className="education-box">
                            What is <br /><span>Gambeth?</span>
                            <Button text="Learn" iconSrc={technologist} style={{ marginRight: 20 }} onClick={() => { }} backgroundColor="#EE8C71" />
                            <img className='education-image' src={cryptocurrency_market_growth} />
                        </div>
                        <div className="education-box">
                            How to make <br /> a <span>deposit</span>
                            <Button text="Learn" iconSrc={technologist} style={{ marginRight: 20 }} onClick={() => { }} backgroundColor="#EE8C71" />
                            <img className='education-image' src={money_and_phone} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
