import React, { useEffect, useState } from 'react';

import { useConnectWallet } from '@web3-onboard/react'

import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'

import { NavLink } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'


// import required modules
import { Keyboard, Navigation, Autoplay } from 'swiper/modules';

import { useSetChain } from "@web3-onboard/react";

import { useStateContext } from '../contexts/ContextProvider'

import { NavBar } from '../components/NavBar'

import Image1 from '../assets/img/slider/1.jpg';
import heroLogo from '../assets/img/hero-img.png';

import { CardSwiperSlide } from '../components/CardSwiperSlide';

import { browseMarkets, truncateTextSize } from '../utils/services';
import { delay } from 'framer-motion';
import { Footer } from '../components/Footer';
import { MarketBox } from '../components/MarketBox';
import { Loader } from '../components/Loader';

export const BrowseMarkets = () => {

  const [{ wallet }, connect] = useConnectWallet();

  const { previousRoute, setPreviousRoute } = useStateContext(false);

  const { activeContract, setActiveContract } = useStateContext();
  const { marketsArray, setMarketsArray } = useStateContext();

  const [loading, setLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState([]);

  const addActiveFilter = (filter) => {
    setActiveFilters([...activeFilters, filter]);
  };

  const removeActiveFilter = (index) => {
    const updatedFilters = [...activeFilters];
    updatedFilters.splice(index, 1);
    setActiveFilters(updatedFilters);
  };

  const handleDropdownChange = (filter, option) => {
    if (option !== 'Any') {
      const existingFilterIndex = activeFilters.findIndex(f => f.startsWith(`${filter} -`));
      if (existingFilterIndex !== -1) {
        const updatedFilters = [...activeFilters];
        updatedFilters.splice(existingFilterIndex, 1, `${filter} - ${option}`);
        setActiveFilters(updatedFilters);
      } else {
        addActiveFilter(`${filter} - ${option}`);
      }
    } else {
      const updatedFilters = activeFilters.filter(f => !f.startsWith(`${filter} -`));
      setActiveFilters(updatedFilters);
    }
  };

  const [
    {
      chains, // the list of chains that web3-onboard was initialized with
      connectedChain, // the current chain the user's wallet is connected to
      settingChain // boolean indicating if the chain is in the process of being set
    },
    setChain // function to call to initiate user to switch chains in their wallet
  ] = useSetChain()

  useEffect(() => {
    if (!marketsArray) {
      setPreviousRoute('browseMarkets');
      //console.log("Loading markets...");
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    if (previousRoute) {

      const getMarkets = async () => {
        return await browseMarkets(activeContract);
      }

      getMarkets().then(result => {
        setMarketsArray(result);
        setLoading(false);
        setPreviousRoute(false);
      });
    }
  }, [activeContract])

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    nextArrow: (
      <div className="c-dhzjXW c-iBHQOu c-iBHQOu-fNKXAf-side-right slick-arrow slick-next" style="display: block;">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="c-fAcSzf" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 17.707L16.414 12 10.707 6.293 9.293 7.707 13.586 12 9.293 16.293z"></path>
        </svg>
      </div>
    ),
    prevArrow: (
      <div className="c-dhzjXW c-iBHQOu c-iBHQOu-bMZvXX-side-left slick-arrow slick-prev" style="display: block;">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="c-fAcSzf" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.293 6.293L7.586 12 13.293 17.707 14.707 16.293 10.414 12 14.707 7.707z"></path>
        </svg>
      </div>
    ),
  };


  return (
    <>
      <NavBarWeb3Onboard />

      <section className='browseMarket'>
        <div className="container">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="filters body_2 d-flex justify-content-center">
                <Dropdown className='user_dropdown'>
                  <Dropdown.Toggle variant="success" id="dropdown-basic dropdown-volume">
                    Volume
                    <svg className='more-icon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803L3.96967 8.78033C3.67678 8.48744 3.67678 8.01256 3.96967 7.71967C4.26256 7.42678 4.73744 7.42678 5.03033 7.71967L12 14.6893L18.9697 7.71967C19.2626 7.42678 19.7374 7.42678 20.0303 7.71967C20.3232 8.01256 20.3232 8.48744 20.0303 8.78033L12.5303 16.2803Z" fill="#F3F9D2" />
                    </svg>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item onClick={() => handleDropdownChange('Volume', 'Any')}>Any</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Volume', 'Under $10.000')}>Under $10.000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Volume', '$10.000 - $50.000')}>$10.000 - $50.000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Volume', '$50.000 - $100.000')}>$50.000 - $100.000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Volume', 'Over $100.000')}>Over $100.000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Volume', 'Custom')}>Custom</Dropdown.Item>


                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className='user_dropdown'>
                  <Dropdown.Toggle variant="success" id="dropdown-basic dropdown-liquidity">
                    Liquidity
                    <svg className='more-icon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803L3.96967 8.78033C3.67678 8.48744 3.67678 8.01256 3.96967 7.71967C4.26256 7.42678 4.73744 7.42678 5.03033 7.71967L12 14.6893L18.9697 7.71967C19.2626 7.42678 19.7374 7.42678 20.0303 7.71967C20.3232 8.01256 20.3232 8.48744 20.0303 8.78033L12.5303 16.2803Z" fill="#F3F9D2" />
                    </svg>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item onClick={() => handleDropdownChange('Liquidity', 'Any')}>Any</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Liquidity', 'Under $5.000')}>Under $5.000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Liquidity', '$5.000 - $10.000')}>$5.000 - $10.000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Liquidity', '$10.000 - $50.000')}>$10.000 - $50.000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Liquidity', 'Over $50.000')}>Over $50.000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Liquidity', 'Custom')}>Custom</Dropdown.Item>


                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className='user_dropdown'>
                  <Dropdown.Toggle variant="success" id="dropdown-basic dropdown-status">
                    Status
                    <svg className='more-icon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803L3.96967 8.78033C3.67678 8.48744 3.67678 8.01256 3.96967 7.71967C4.26256 7.42678 4.73744 7.42678 5.03033 7.71967L12 14.6893L18.9697 7.71967C19.2626 7.42678 19.7374 7.42678 20.0303 7.71967C20.3232 8.01256 20.3232 8.48744 20.0303 8.78033L12.5303 16.2803Z" fill="#F3F9D2" />
                    </svg>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item onClick={() => handleDropdownChange('Status', 'All')}>All</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Status', 'Active')}>Active</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Status', 'Resolved')}>Resolved</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className='user_dropdown'>
                  <Dropdown.Toggle variant="success" id="dropdown-basic dropdown-end-date">
                    End date
                    <svg className='more-icon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803L3.96967 8.78033C3.67678 8.48744 3.67678 8.01256 3.96967 7.71967C4.26256 7.42678 4.73744 7.42678 5.03033 7.71967L12 14.6893L18.9697 7.71967C19.2626 7.42678 19.7374 7.42678 20.0303 7.71967C20.3232 8.01256 20.3232 8.48744 20.0303 8.78033L12.5303 16.2803Z" fill="#F3F9D2" />
                    </svg>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item onClick={() => handleDropdownChange('End date', 'All')}>All</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('End date', 'Ends today')}>Ends today</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('End date', 'Ends this week')}>Ends this week</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('End date', 'Ends this month')}>Ends this month</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('End date', 'Custom')}>Custom</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className='user_dropdown'>
                  <Dropdown.Toggle variant="success" id="dropdown-basic dropdown-lock-date">
                    Lock date
                    <svg className='more-icon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803L3.96967 8.78033C3.67678 8.48744 3.67678 8.01256 3.96967 7.71967C4.26256 7.42678 4.73744 7.42678 5.03033 7.71967L12 14.6893L18.9697 7.71967C19.2626 7.42678 19.7374 7.42678 20.0303 7.71967C20.3232 8.01256 20.3232 8.48744 20.0303 8.78033L12.5303 16.2803Z" fill="#F3F9D2" />
                    </svg>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu">
                    <Dropdown.Item onClick={() => handleDropdownChange('Lock date', 'All')}>All</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Lock date', 'Locks today')}>Locks today</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Lock date', 'Locks this week')}>Locks this week</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Lock date', 'Locks this month')}>Locks this month</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => handleDropdownChange('Lock date', 'Custom')}>Custom</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="active_filters body_2 d-flex">
                {activeFilters.map((filter, index) => (
                  <div key={index} className="filter">
                    {filter}{' '}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" onClick={() => removeActiveFilter(index)}>
                      <path d="M6.28033 5.21967C5.98744 4.92678 5.51256 4.92678 5.21967 5.21967C4.92678 5.51256 4.92678 5.98744 5.21967 6.28033L8.93934 10L5.21967 13.7197C4.92678 14.0126 4.92678 14.4874 5.21967 14.7803C5.51256 15.0732 5.98744 15.0732 6.28033 14.7803L10 11.0607L13.7197 14.7803C14.0126 15.0732 14.4874 15.0732 14.7803 14.7803C15.0732 14.4874 15.0732 14.0126 14.7803 13.7197L11.0607 10L14.7803 6.28033C15.0732 5.98744 15.0732 5.51256 14.7803 5.21967C14.4874 4.92678 14.0126 4.92678 13.7197 5.21967L10 8.93934L6.28033 5.21967Z" fill="#F3F9D2" />
                    </svg>
                  </div>
                ))}
              </div>
              <div className='markets-box d-flex'>
                {marketsArray.map(function (market, i) {
                  return MarketBox({ market, i })

                })}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
