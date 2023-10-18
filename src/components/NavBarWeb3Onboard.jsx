import React, { useEffect, useState } from 'react'

import { motion } from "framer-motion";

import { NavLink } from "react-router-dom";

import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { ethers } from "ethers";

import {
    formatAddress,
    formatBalance,
} from '../utils/services'

import ooAbi from '../libs/gambeth-oo-abi';

import { browseMarkets, getMarket } from '../utils/services';

import { useStateContext } from '../contexts/ContextProvider';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';

import logo from '../assets/img/logo.png';

export const NavBarWeb3Onboard = () => {

    const { wrongChain, setWrongChain } = useStateContext();
    const { provider, setProvider } = useStateContext();
    const { providerLoaded, setProviderLoaded } = useStateContext();
    const { marketId, setMarketId } = useStateContext();
    const { activeMarketId, setActiveMarketId } = useStateContext();
    const { activeContract, setActiveContract } = useStateContext();
    const { signer, setSigner } = useStateContext();
    const { owner, setOwner } = useStateContext();
    const { betType, setBetType } = useStateContext();

    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
    const [
        {
            chains, // the list of chains that web3-onboard was initialized with
            connectedChain, // the current chain the user's wallet is connected to
            settingChain // boolean indicating if the chain is in the process of being set
        },
        setChain // function to call to initiate user to switch chains in their wallet
    ] = useSetChain()

    const [shown, setShown] = useState(false);

    const showMenu = {
        enter: {
            opacity: 1,
            top: 50,
            y: 0,
            display: "block",
            position: "absolute",
            cursor: "pointer"
        },
        exit: {
            y: -10,
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
        }
        else {
            setWrongChain(false);
            //setProviderLoaded(await setProvider(new ethers.BrowserProvider(wallet.provider, 'any')))

            setProvider(new ethers.BrowserProvider(wallet.provider, 'any'));


        }
    }

    useEffect(() => {

        let temp_singer = null;
        let temp_activeContract = null;

        const start = async () => {

            temp_singer = await provider.getSigner();

            console.log("Signer: " + temp_singer);

            if (marketId && activeContract) {
                //alert("marketId && activeContract");
                const betKind = (await getMarket(marketId)).kind;
                switch (betKind) {
                    case 0n:
                        temp_activeContract = new ethers.Contract(import.meta.env.VITE_OO_CONTRACT_ADDRESS, ooAbi, provider).connect(temp_singer);
                        break;
                    case 1n:
                        temp_activeContract = new ethers.Contract(import.meta.env.VITE_HUMAN_CONTRACT_ADDRESS, [], provider).connect(temp_singer);
                        break;
                }
            } else if (betType) {
                //alert("betType: " + betType);
                switch (betType) {
                    case "oo":
                        console.log("oo");
                        temp_activeContract = new ethers.Contract(import.meta.env.VITE_OO_CONTRACT_ADDRESS, ooAbi, provider).connect(temp_singer);
                        break;
                    case "bc":
                        temp_activeContract = import.meta.env.VITE_HUMAN_CONTRACT_ADDRESS
                            ? temp_activeContract = new ethers.Contract(import.meta.env.VITE_HUMAN_CONTRACT_ADDRESS, [], provider).connect(temp_singer)
                            : null;
                        break;
                    default:
                        temp_activeContract = new ethers.Contract(import.meta.env.VITE_PROVABLE_CONTRACT_ADDRESS, provableOracleAbi, provider).connect(signer);
                        break;
                }
                /*
                if (marketId) {
                    await loadProvider();
                }
                */
            }

            if (temp_activeContract) {
                console.log("Active contract: ");
                console.log(temp_activeContract);
                console.log("Fin");
                setOwner(await temp_singer.getAddress());
                console.log("Owner address: " + owner);

                //console.log(browseMarkets(activeContract));
            }

        }

        if (provider) {
            console.log("start");
            start().then(result => {
                setSigner(temp_singer);
                setActiveContract(temp_activeContract);
            })
        }

    }, [provider])


    useEffect(() => {
        if (!wallet?.provider) {
            setProvider(null)
        } else {
            verifyCorrectChain();
        }
    }, [wallet])

    useEffect(() => {
        console.log(connectedChain);
        if (wallet) {
            verifyCorrectChain();
        }

    }, [connectedChain])

    const switchToChain = () => {
        setChain({ chainId: import.meta.env.VITE_CORRECT_CHAIN });
    }

    return (
        <>
            {wrongChain && (
                <div className='error_alert'>You are on the incorrect network. Please a <button className='swithToChain' onClick={switchToChain}> switch to Goerli</button></div>
            )}

            <header id="header" className="header fixed-top d-flex align-items-center">
                <Navbar expand="lg" className="navmenu fixed-top">
                    <Container fluid>
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
                            <Nav className="me-auto">
                                <NavLink to="/browsemarkets" className='animated-line'>Browse market</NavLink>
                                <NavLink to="/createmarket" className='animated-line'>Create market</NavLink>
                                <NavLink to="/whatwedo">What we do?</NavLink>
                            </Nav>
                            <div className="form-group has-search">
                                <i className="bi bi-search form-control-feedback"></i>
                                <input type="text" className="form-control" placeholder="Search market" />
                            </div>
                        </Navbar.Collapse>
                        {!wallet ? (
                            <button
                                className="wallet_connect_button"
                                onClick={async () => {
                                    const walletsConnected = await connect()
                                    console.log('connected wallets: ', walletsConnected)
                                }}
                            >
                                Connect
                            </button>
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
                                        <span>{formatAddress(wallet?.accounts[0]?.address)}</span>
                                        <i className="bi bi-person"></i>
                                    </div>

                                    <motion.ul
                                        variants={showMenu}
                                        initial="exit"
                                        animate={shown ? "enter" : "exit"}
                                        className="dropdown-menu absolute"
                                    >
                                        {wallet?.accounts[0]?.balance && (

                                            <NavLink to="" className='animated-line pt-5'>
                                                <motion.li
                                                    whileHover={{
                                                        x: 1,
                                                    }}
                                                    className="cursor-pointer my-auto"
                                                >
                                                    {formatBalance(Object.values(wallet?.accounts[0]?.balance))} ETH
                                                </motion.li>

                                            </NavLink>

                                        )}
                                        {/*
                                    <NavLink to="/browsemarkets" className='animated-line'>
                                        <motion.li
                                            whileHover={{
                                                color: "#FFB703",
                                                x: 2,
                                            }}
                                            className="cursor-pointer"
                                        >
                                            Browse markets
                                        </motion.li>
                                    </NavLink>
                                    */}
                                        <NavLink to="/createmarket" className='animated-line'>
                                            <motion.li
                                                whileHover={{
                                                    x: 2,
                                                }}
                                                className="cursor-pointer"
                                            >
                                                Create market
                                            </motion.li>
                                        </NavLink>

                                        <NavLink to="/whatwedo" className='animated-line'>
                                            <motion.li
                                                whileHover={{
                                                    x: 2,
                                                }}
                                                className="cursor-pointer"
                                            >
                                                What we do?
                                            </motion.li>
                                        </NavLink>

                                        <NavDropdown.Divider />

                                        <NavDropdown.Item onClick={() => { disconnect({ label: wallet.label }); setProvider(null); setWrongChain(false); setShown(false) }} className='wallet_disconnet'>
                                            Disconnet
                                        </NavDropdown.Item>

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
