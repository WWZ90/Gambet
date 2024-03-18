import React, {useEffect, useState, useRef} from 'react'

import {motion} from "framer-motion";

import {NavLink, useNavigate} from "react-router-dom";

import {useConnectWallet, useSetChain} from "@web3-onboard/react";
import {ethers} from "ethers";

import {
    formatAddress,
    formatBalance,
} from '../utils/services'

import ooAbi from '../libs/gambeth-oo-abi';
import tokenAbi from '../libs/gambeth-oo-token-abi';

import {browseMarkets, getMarket} from '../utils/services';

import {useStateContext} from '../contexts/ContextProvider';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';

import logo from '../assets/img/gambeth-logo-text.png';
import magnifying_glass from '../assets/icons/png/magnifying-glass.png';
import rocket from '../assets/icons/png/noto_rocket.png';
import more from '../assets/icons/png/more.png';
import plus from '../assets/icons/png/plus.png';

import {Button} from './Button';

export const NavBarWeb3Onboard = () => {

    const {wrongChain, setWrongChain} = useStateContext();
    const {provider, setProvider} = useStateContext();
    const {providerLoaded, setProviderLoaded} = useStateContext();
    const {marketId, setMarketId} = useStateContext();
    const {activeMarketId, setActiveMarketId} = useStateContext();
    const {activeContract, setActiveContract} = useStateContext();
    const {usdc, setUSDC} = useStateContext();
    const {awaitingApproval, setAwaitingApproval} = useStateContext();
    const {usdcBalance, setUSDCBalance} = useStateContext();
    const {signer, setSigner} = useStateContext();
    const {owner, setOwner} = useStateContext();
    const {betType, setBetType} = useStateContext();

    const {marketsArray, setMarketsArray} = useStateContext();

    const {cartCount, setCartCount} = useStateContext();
    const [addedToCart, setAddedToCart] = useState(false);

    const [{wallet, connecting}, connect, disconnect] = useConnectWallet();
    const [
        {
            chains, // the list of chains that web3-onboard was initialized with
            connectedChain, // the current chain the user's wallet is connected to
            settingChain // boolean indicating if the chain is in the process of being set
        },
        setChain // function to call to initiate user to switch chains in their wallet
    ] = useSetChain()

    const [showMenuM, setShowMenuM] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMenuM(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMouseEnter = () => {
        setShowMenuM(true);
    };

    const handleMouseLeave = () => {
        setShowMenuM(false);
    };

    const handleClick = () => {
        setShowMenuM(!showMenuM);
    };

    const [shown, setShown] = useState(false);

    const showMenu = {
        enter: {
            opacity: 1,
            top: 55,
            x: -5,
            display: "block",
            position: "absolute",
            cursor: "pointer"
        },
        exit: {
            top: 55,
            x: 5,
            opacity: 0,
            transition: {
                duration: 0.1,
            },
            transitionEnd: {
                display: "none",
                position: "absolute",
                cursor: "pointer"
            },
        },
    };

    const verifyCorrectChain = async () => {
        if (connectedChain.id != import.meta.env.VITE_CORRECT_CHAIN) //Goerli
        {
            setWrongChain(true);
        } else {
            setWrongChain(false);
            //setProviderLoaded(await setProvider(new ethers.BrowserProvider(wallet.provider, 'any')))

            setProvider(new ethers.BrowserProvider(wallet.provider, 'any'));


        }
    }

    useEffect(() => {

        const setupActiveContract = (connectedContract) => {
            const gambethBackend = "https://gambeth-backend.fly.dev";
            // const gambethBackend = "http://localhost:8080";
            const iface = ethers.Interface.from(ooAbi);
            const fallbackHandler = {
                get(target, prop, receiver) {
                    const parseResponse = (input) => {
                        let dataType = Object.keys(input)[0];
                        let data = input[dataType];
                        const value = data.map
                            ? data.map(parseResponse)
                            : typeof data === "object"
                                ? parseResponse(data)
                                : ["Uint", "Int"].includes(dataType)
                                    ? parseInt(data)
                                    : data;
                        return value;
                    };

                    const handleWalletCall = (prop) => {
                        switch (prop) {
                            case "queryFilter":
                                return function (filter, fromBlock) {
                                    const body = JSON.stringify({name: filter[0], topics: filter[1]});
                                    return fetch(`${gambethBackend}/event`, {
                                        method: "POST",
                                        headers: {"Content-Type": "application/json"},
                                        body
                                    })
                                        .then(r => {
                                            console.log("Response is", r);
                                            return r.json()
                                        })
                                        .then(r => r.map(r => iface.parseLog(r)))
                                        .catch(console.error);
                                };
                            case "filters":
                                return new Proxy({}, {
                                    get(target, prop) {
                                        return function () {
                                            return [prop, [...arguments].concat(new Array(3 - [...arguments].length).fill(null))]
                                        }
                                    }
                                });
                            case "fillOrder":
                            case "createOptimisticBet":
                                return function () {
                                    console.log(prop, ...arguments);
                                    return connectedContract
                                        ? connectedContract[prop](...arguments)
                                        : console.error("Tried to call write method without connected contract")
                                }
                            default:
                                return function () {
                                    let args = iface.encodeFunctionData(prop, [...arguments]);
                                    return fetch(`${gambethBackend}/method`, {
                                        method: "POST",
                                        headers: {"Content-Type": "application/json"},
                                        body: JSON.stringify({
                                            name: prop,
                                            args
                                        })
                                    })
                                        .then(r => r.json())
                                        .then(parseResponse);
                                }
                        }
                    }

                    try {
                        console.log("Trying to call original method", prop);
                        const originalReturn = Reflect.get(target, prop, receiver);
                        console.log("Called original method without error", prop, originalReturn);
                        if (originalReturn?.then) {
                            console.log("Original return is a promise, adding fallback logic to it", originalReturn);
                            return originalReturn.catch(async error => {
                                // console.error("Error calling injected wallet, trying backend fallback handler: ", error);
                                return handleWalletCall(prop);
                            });
                        } else if (originalReturn?.constructor?.name === "AsyncFunction") {
                            console.log("Original return is an async function, adding fallback logic to it", originalReturn);
                            return async function () {
                                try {
                                    return await originalReturn(...arguments);
                                } catch (error) {
                                    // console.error("Error calling injected wallet, trying backend fallback handler: ", error);
                                    return handleWalletCall(prop)(...arguments);
                                }
                            }
                        } else if (!originalReturn) {
                            const fallback = handleWalletCall(prop);
                            console.log("Original return is undefined, using fallback", fallback);
                            return fallback;
                        } else {
                            return originalReturn;
                        }
                    } catch (error) {
                        console.error("Error calling injected wallet, trying backend fallback handler: ", error);
                        return handleWalletCall(prop);
                    }
                }
            }

            if (connectedContract) {
                let activeContract = new Proxy(connectedContract, fallbackHandler);
                setActiveContract(activeContract);
            } else {
                setActiveContract(new Proxy({}, fallbackHandler));
            }
        }

        const start = async () => {
            if (!provider) {
                return;
            }

            const tempSigner = await provider.getSigner();
            const tempActiveContract = new ethers.Contract(import.meta.env.VITE_OO_CONTRACT_ADDRESS, ooAbi, provider).connect(tempSigner);
            const tempUsdc = new ethers.Contract(import.meta.env.VITE_USDC_ADDRESS, tokenAbi, provider).connect(tempSigner);
            setOwner(await tempSigner.getAddress());
            setSigner(tempSigner);
            setUSDC(tempUsdc);
            return tempActiveContract;
        }

        start().catch(err => {
            console.error(err);
            return null;
        }).then(setupActiveContract);

    }, [provider])

    const handleConnectWallet = async () => {
        await connect().then(async (result) => {
            await handleDepositUSDC();
        })
    }

    const handleDepositUSDC = async () => {
        setAwaitingApproval(true);
        try {
            await usdc.balanceOf(owner).then(async (balance) => {
                console.log("Approving USDC");
                await usdc.approve(import.meta.env.VITE_OO_CONTRACT_ADDRESS, balance).catch(console.error).then(async tx => {
                    console.log("Waiting for USDC approval");
                    await tx.wait();
                    await usdc.allowance(owner, import.meta.env.VITE_OO_CONTRACT_ADDRESS).then(async (allowance) => {
                        const wallet_balance = balance > allowance ? allowance : balance;
                        let b = (Number(wallet_balance) / 1e6).toFixed(3);
                        setUSDCBalance(b);
                        setAwaitingApproval(false);
                    });
                });
            });
        } catch {
            setAwaitingApproval(false);
        }
    }

    useEffect(() => {
        //debugger;
        if (!wallet?.provider) {
            setProvider(null)
        } else {
            verifyCorrectChain();
        }
    }, [wallet])

    useEffect(() => {
        if (wallet) {
            verifyCorrectChain();
        }

    }, [connectedChain])

    const switchToChain = () => {
        setChain({chainId: import.meta.env.VITE_CORRECT_CHAIN});
    }

    return (
        <>
            {wrongChain && (
                <div className='error_alert'>You are on the incorrect network. Please a <button className='swithToChain'
                                                                                                onClick={switchToChain}> switch
                    to Goerli</button></div>
            )}

            <header id="header" className="header fixed-top d-flex align-items-center">
                <Navbar expand="lg" className="navmenu fixed-top">
                    <Container>
                        <Navbar.Brand>
                            <NavLink to="/">
                                <img
                                    src={logo}
                                    className="d-inline-block align-top logo"
                                    width="160"
                                    alt="Gambeth"
                                />
                            </NavLink>
                        </Navbar.Brand>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <div className="row nav-center">
                                <div className="col-10">
                                    <div className="search-container">
                                        <input type="text" className="search-input"
                                               placeholder="Searchs for markets and more..."/>
                                        <div className="search-icon">
                                            <img src={magnifying_glass} alt="Search"/>
                                        </div>
                                    </div>

                                </div>
                                <div className="col-2">
                                    <div ref={dropdownRef}>
                                        <Dropdown
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                            onClick={handleClick}
                                            show={showMenuM}
                                        >
                                            <Dropdown.Toggle id="dropdown-custom-components"
                                                             className="dropdown-toggle">
                                                Markets
                                                <img src={more} alt="More Icon"
                                                     className={`more-icon ${showMenuM ? 'rotate' : ''}`}/>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="dropdown-menu">
                                                <Dropdown.Item href='/createmarket' className='d-flex'>
                                                    <img src={plus}/>
                                                    <span>Create market</span>
                                                </Dropdown.Item>
                                                <Dropdown.Divider/>
                                                <Dropdown.Item href='/browsemarkets' className='d-flex'>
                                                    <img src={magnifying_glass}/>
                                                    <span>Browse market</span>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>


                        </Navbar.Collapse>
                        {!wallet ? (
                            <>
                                <Button text="Connect" iconSrc={rocket} onClick={handleConnectWallet}
                                        backgroundColor="#6F75E5"/>
                            </>
                        ) : (

                            /*
                            <NavDropdown className='wallet_address animate slideIn' title={formatAddress(wallet?.accounts[0]?.address)} id="basic-nav-dropdown">
                                {wallet?.accounts[0]?.balance && (
                                    <NavDropdown.Item>{formatBalance(Object.values(wallet?.accounts[0]?.balance))} ETH</NavDropdown.Item>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => { disconnect({ label: wallet.label }) }}>
                                    Disconnet
                                </NavDropdown.Item>
                            </NavDropdown>
                            */
                            <>
                                <motion.div
                                    onHoverStart={() => setShown(true)}
                                    onHoverEnd={() => setShown(false)}
                                >

                                    <div className="wallet_address">
                                        <div className="">
                                            <span>{formatAddress(wallet?.accounts[0]?.address)}</span>
                                            <i className="bi bi-person"></i>
                                        </div>
                                        <div className='cart'>
                                            <i className="bi bi-cart3">
                                                {cartCount > 0 && (
                                                    <span id="cart_menu_num" data-action="cart-can"
                                                          className={`badge rounded-circle ${cartCount > 0 ? 'badge_active' : ''}`}>{cartCount}</span>
                                                )}

                                            </i>
                                        </div>

                                    </div>

                                    <motion.ul
                                        variants={showMenu}
                                        initial="exit"
                                        animate={shown ? "enter" : "exit"}
                                        className="dropdown-menu absolute"
                                    >
                                        {usdcBalance ? (

                                            <a className='animated-line balance'>
                                                <motion.li
                                                    className="cursor-pointer my-auto"
                                                >
                                                    {usdcBalance} USDC
                                                </motion.li>

                                            </a>

                                        ) : (
                                            <button onClick={handleDepositUSDC} className='wallet_deposit'>
                                                {awaitingApproval ? (
                                                    <span>Awaiting...</span>
                                                ) : (
                                                    <span>Aprove USDC</span>
                                                )}

                                            </button>
                                        )}

                                        <NavLink to="/browsemarkets" className='animated-line'>
                                            <motion.li className="cursor-pointer">
                                                Browse markets
                                            </motion.li>
                                        </NavLink>

                                        <NavLink to="/createmarket" className='animated-line'>
                                            <motion.li className="cursor-pointer">
                                                Create market
                                            </motion.li>
                                        </NavLink>

                                        <NavLink to="/cart" className='animated-line'>
                                            <motion.li className="cursor-pointer">
                                                View cart
                                            </motion.li>
                                        </NavLink>

                                        <NavLink to="/whatwedo" className='animated-line'>
                                            <motion.li className="cursor-pointer">
                                                What we do?
                                            </motion.li>
                                        </NavLink>

                                        <NavDropdown.Divider/>

                                        <button onClick={() => {
                                            disconnect({label: wallet.label});
                                            setProvider(null);
                                            setWrongChain(false);
                                            setShown(false);
                                            setActiveContract(null);
                                            setUSDCBalance(null);
                                            localStorage.removeItem('activeContract')
                                        }} className='wallet_disconnet'>
                                            Disconnet
                                        </button>

                                    </motion.ul>
                                </motion.div>
                            </>
                        )}
                    </Container>
                </Navbar>
            </header>
        </>
    )
}
