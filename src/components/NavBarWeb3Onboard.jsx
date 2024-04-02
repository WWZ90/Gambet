import React, { useEffect, useState, useRef } from 'react'

import { motion } from "framer-motion";

import { NavLink } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';

import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { ethers } from "ethers";
import { Presets, Client } from "userop"


import ooAbi from '../libs/gambeth-oo-abi';
import tokenAbi from '../libs/gambeth-oo-token-abi';
import { useStateContext } from '../contexts/ContextProvider';

import { formatAddress, tokenToNumber } from '../utils/services'

import { Button } from './Button';

import logo from '../assets/img/gambeth-logo-text.png';
import rocket from '../assets/icons/png/noto_rocket.png';
import standing_coin_front from '../assets/icons/png/standing coin front.png';
import add from "../assets/icons/png/+.png";
import {generateFromString} from "generate-avatar";

export const NavBarWeb3Onboard = () => {

    const { wrongChain, setWrongChain } = useStateContext();
    const { provider, setProvider } = useStateContext();

    const { activeContract, setActiveContract } = useStateContext();
    const { usdc, setUSDC } = useStateContext();
    const { awaitingApproval, setAwaitingApproval } = useStateContext();
    const { usdcBalance, setUSDCBalance } = useStateContext();
    const { signer, setSigner } = useStateContext();
    const { owner, setOwner } = useStateContext();
    const { cartCount, setCartCount } = useStateContext();
    const [addedToCart, setAddedToCart] = useState(false);

    const [modalShow, setModalShow] = useState(false);

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

    const gasslessAddress = async (rpcUrl, signer) => {
        if (!signer) {
            return null;
        }
        const paymasterUrl = "https://api.stackup.sh/v1/paymaster/7daadcaada371e09de5519d2522bbe7691554adbf8cf2869c6dbbaedb90633bb";
        const paymasterContext = { type: "payg" };
        const opts = {
            paymasterMiddleware: Presets.Middleware.verifyingPaymaster(
                paymasterUrl,
                paymasterContext
            )
        }
        const builder = await Presets.Builder.SimpleAccount.init(signer, rpcUrl, opts);
        const address = builder.getSender();
        return [address, builder];
    }

    const writeOps = ["fillOrder", "createOptimisticBet"];

    const calculateCostForOptimisticBet = (parameters) => {
        throw "Unimplemented"
    }

    const calculateCostForFillOrder = (parameters) => {
        let cost = 0;
        console.log(parameters);
        const buys = {
            // Filter only buys
            amounts: parameters[0].filter((e, i) => parameters[2][i] === 0n),
            prices: parameters[1].filter((e, i) => parameters[2][i] === 0n)
        }
        for (let i = 0; i < buys.amounts.length; i++) {
            cost += buys.amounts[i] * (buys.prices[i] || 1e6);
        }
        console.log("Cost is", cost);
        return BigInt(cost);
    }

    const gaslessTransaction = async (contract, prop, args) => {
        let tempSigner = signer;
        if (!signer || !contract || !owner) {
            if (provider) {
                tempSigner = await provider.getSigner();
                setSigner(tempSigner || signer);
            } else {
                console.error("Missing required signer/contract", signer, contract);
                return;
            }
        }
        console.log(prop, args);
        const rpcUrl = "https://public.stackup.sh/api/v1/node/polygon-mumbai";
        const [address, builder] = await gasslessAddress(rpcUrl, signer || tempSigner);
        setOwner(address);
        // Encode the calls
        const callTo = [import.meta.env.VITE_USDC_ADDRESS, await contract.getAddress()];
        const costCalculator = {
            "fillOrder": calculateCostForFillOrder,
            "createOptimisticBet": calculateCostForOptimisticBet
        }
        const cost = costCalculator[prop](args);
        const tempUsdc = new ethers.Contract(import.meta.env.VITE_USDC_ADDRESS, tokenAbi, provider).connect(tempSigner);
        setUSDC(tempUsdc);
        const callData = [
            tempUsdc.interface.encodeFunctionData("approve", [import.meta.env.VITE_OO_CONTRACT_ADDRESS, cost]),
            contract.interface.encodeFunctionData(prop, args)
        ];
        await tempUsdc.transfer(address, cost).then(tx => tx.wait());
        // Send the User Operation to the ERC-4337 mempool
        const client = await Client.init(rpcUrl);
        const res = await client.sendUserOperation(builder.executeBatch(callTo, callData), {
            onBuild: (op) => console.log("Signed UserOperation:", op),
        });

        // Return receipt
        //console.log(`UserOpHash: ${res.userOpHash}`);
        //console.log("Waiting for transaction...");
        const ev = await res.wait();
        //console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
        //console.log(`View here: https://jiffyscan.xyz/userOpHash/${res.userOpHash}`);
    }

    useEffect(() => {
        start().catch(err => {
            console.error(err);
            return null;
        }).then(setupActiveContract);
    }, [provider])

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
                                const body = JSON.stringify({
                                    name: filter?.fragment?.name || filter[0],
                                    topics: filter[1]?.map ? filter[1] : [null, null, null]
                                });
                                //console.log("Querying filter", prop, [...arguments], body);
                                return fetch(`${gambethBackend}/event`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body
                                })
                                    .then(r => {
                                        //console.log("Response is", r);
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
                            return async function () {
                                if (!connectedContract) {
                                    return alert("Tried to call write method without connected contract")
                                }
                                return gaslessTransaction(connectedContract, prop, [...arguments]);
                            }
                        default:
                            return function () {
                                let args = iface.encodeFunctionData(prop, [...arguments]);
                                return fetch(`${gambethBackend}/method`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
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
                    let originalReturn = Reflect.get(target, prop, receiver);
                    originalReturn = originalReturn?.catch?.(async error => {
                        return originalReturn.catch(async error => {
                            console.error("Error calling injected wallet promise, trying backend fallback handler: ", error);
                            return handleWalletCall(prop);
                        }).then(r => r === undefined ? handleWalletCall(prop) : r);
                    }) || originalReturn;

                    if (originalReturn?.constructor?.name === "AsyncFunction") {
                        //console.log("Original return is an async function, adding fallback logic to it", prop, originalReturn, connectedContract);
                        return async function () {
                            try {
                                const r = writeOps.includes(prop) ? await handleWalletCall(prop)(...arguments) : await connectedContract?.[prop]?.(...arguments);
                                if (r === undefined && !writeOps.includes(prop)) {
                                    return handleWalletCall(prop)(...arguments);
                                }
                                return r;
                            } catch (error) {
                                console.error("Error calling injected wallet async function, trying backend fallback handler: ", error, prop, originalReturn, [...arguments]);
                                if (writeOps.includes(prop)) {
                                    return null;
                                } else {
                                    const r = await handleWalletCall(prop)(...arguments);
                                    return r;
                                }
                            }
                        }
                    } else if (originalReturn === undefined) {
                        const fallback = handleWalletCall(prop);
                        //console.log("Original return is undefined, using fallback", prop, fallback, connectedContract);
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
            setActiveContract(new Proxy(fallbackHandler, fallbackHandler));
        }
    }

    const start = async () => {
        if (!provider) {
            return;
        }

        const tempSigner = await provider.getSigner();
        const tempActiveContract = new ethers.Contract(import.meta.env.VITE_OO_CONTRACT_ADDRESS, ooAbi, provider).connect(tempSigner);
        const tempUsdc = new ethers.Contract(import.meta.env.VITE_USDC_ADDRESS, tokenAbi, provider).connect(tempSigner);
        setSigner(tempSigner);
        const rpcUrl = "https://public.stackup.sh/api/v1/node/polygon-mumbai";
        gasslessAddress(rpcUrl, tempSigner).then(async ([owner]) => {
            console.log("Owner is " + owner);
            setOwner(owner);

            const b = await tempUsdc.balanceOf(owner);
            const balance = await tokenToNumber(b);
            setUSDCBalance(balance);
            console.log('Balance USDC: ' + balance);
        });
        setUSDC(tempUsdc);

        return tempActiveContract;
    }


    const handleConnectWallet = async () => {
        await connect();
    }

    useEffect(() => {
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
        setChain({ chainId: import.meta.env.VITE_CORRECT_CHAIN });
    }

    return (
        <>
            {wrongChain && (
                <div className='error_alert'>You are on the incorrect network. Please a <button className='swithToChain'
                    onClick={switchToChain}> switch
                    to Polygon-Mumbai</button></div>
            )}

            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                className='body_2'
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Deposit USDC (Polygon)
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        To continue you must send USDC on the Polygon network to this address:
                    </p>
                    <p>
                        {owner}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button text='Close' onClick={() => setModalShow(false)} />
                </Modal.Footer>
            </Modal>

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
                            <div className="d-flex justify-content-between nav-center">
                                <div className="d-flex align-content-center search-container">
                                    <input type="text" className="search-input"
                                        placeholder="Searchs for markets and more..." />
                                    <div className="search-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M10.5 3.75C6.77208 3.75 3.75 6.77208 3.75 10.5C3.75 14.2279 6.77208 17.25 10.5 17.25C12.3642 17.25 14.0506 16.4953 15.273 15.273C16.4953 14.0506 17.25 12.3642 17.25 10.5C17.25 6.77208 14.2279 3.75 10.5 3.75ZM2.25 10.5C2.25 5.94365 5.94365 2.25 10.5 2.25C15.0563 2.25 18.75 5.94365 18.75 10.5C18.75 12.5078 18.032 14.3491 16.8399 15.7793L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L15.7793 16.8399C14.3491 18.032 12.5078 18.75 10.5 18.75C5.94365 18.75 2.25 15.0563 2.25 10.5Z" fill="#F3F9D2" />
                                        </svg>

                                    </div>
                                </div>
                                <div className="d-flex align-items-center right_info">
                                    <NavLink to="/education" className='edu'>
                                        <span className='body_2'>Education</span>
                                    </NavLink>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                            Markets
                                            <svg className='more-icon' width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M5.21967 8.21967C5.51256 7.92678 5.98744 7.92678 6.28033 8.21967L10 11.9393L13.7197 8.21967C14.0126 7.92678 14.4874 7.92678 14.7803 8.21967C15.0732 8.51256 15.0732 8.98744 14.7803 9.28033L10.5303 13.5303C10.3897 13.671 10.1989 13.75 10 13.75C9.80109 13.75 9.61032 13.671 9.46967 13.5303L5.21967 9.28033C4.92678 8.98744 4.92678 8.51256 5.21967 8.21967Z" fill="#F3F4D4" />
                                            </svg>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="dropdown-menu">
                                            <Dropdown.Item className='d-flex'>
                                                <NavLink to="/createmarket">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 3.75C12.4142 3.75 12.75 4.08579 12.75 4.5V11.25H19.5C19.9142 11.25 20.25 11.5858 20.25 12C20.25 12.4142 19.9142 12.75 19.5 12.75H12.75V19.5C12.75 19.9142 12.4142 20.25 12 20.25C11.5858 20.25 11.25 19.9142 11.25 19.5V12.75H4.5C4.08579 12.75 3.75 12.4142 3.75 12C3.75 11.5858 4.08579 11.25 4.5 11.25H11.25V4.5C11.25 4.08579 11.5858 3.75 12 3.75Z" fill="#F8F8E5" />
                                                    </svg>
                                                    <span>Create market</span>
                                                </NavLink>
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item className='d-flex'>
                                                <NavLink to="/browsemarkets" className='animated-line'>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M10.5 3.75C6.77208 3.75 3.75 6.77208 3.75 10.5C3.75 14.2279 6.77208 17.25 10.5 17.25C12.3642 17.25 14.0506 16.4953 15.273 15.273C16.4953 14.0506 17.25 12.3642 17.25 10.5C17.25 6.77208 14.2279 3.75 10.5 3.75ZM2.25 10.5C2.25 5.94365 5.94365 2.25 10.5 2.25C15.0563 2.25 18.75 5.94365 18.75 10.5C18.75 12.5078 18.032 14.3491 16.8399 15.7793L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L15.7793 16.8399C14.3491 18.032 12.5078 18.75 10.5 18.75C5.94365 18.75 2.25 15.0563 2.25 10.5Z" fill="#F3F9D2" />
                                                    </svg>
                                                    <span>Browse market</span>
                                                </NavLink>
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    {!wallet ? (
                                        <>
                                            <Button text="Connect" iconSrc={rocket} onClick={handleConnectWallet}
                                                backgroundColor="#6F75E5" />
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
                                            <div className="wallet_info body_2 justify-content-between">
                                                <div className="">
                                                    <img src={standing_coin_front} />
                                                </div>
                                                <div className="">
                                                    <div>Wallet</div>
                                                    <div>
                                                        {usdcBalance ? (
                                                            <span>${usdcBalance}</span>
                                                        ) : (
                                                            <span>$0</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="divider"></div>
                                                <div className="">
                                                    <div>Portfolio</div>
                                                    <div>$1002</div>
                                                </div>
                                                <Button cName="short-icon-button add" iconSrc={add} onClick={() => setModalShow(true)} />
                                            </div>
                                            <div className='cart_icon'>
                                                <NavLink to="/cart">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                                        <path d="M14.8569 17.5817C16.7514 17.357 18.5783 16.9116 20.3111 16.2719C18.8743 14.677 17.9998 12.5656 17.9998 10.25V9.54919C17.9999 9.53281 18 9.51641 18 9.5C18 6.18629 15.3137 3.5 12 3.5C8.68629 3.5 6 6.18629 6 9.5L5.9998 10.25C5.9998 12.5656 5.12527 14.677 3.68848 16.2719C5.4214 16.9116 7.24843 17.357 9.14314 17.5818M14.8569 17.5817C13.92 17.6928 12.9666 17.75 11.9998 17.75C11.0332 17.75 10.0799 17.6929 9.14314 17.5818M14.8569 17.5817C14.9498 17.8711 15 18.1797 15 18.5C15 20.1569 13.6569 21.5 12 21.5C10.3431 21.5 9 20.1569 9 18.5C9 18.1797 9.05019 17.8712 9.14314 17.5818" stroke="#F3F9D2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    {cartCount > 0 && (
                                                        <span data-action="cart-can"
                                                            className={`badge rounded-circle cart_notification ${cartCount > 0 ? 'badge_active' : ''}`}></span>
                                                    )}
                                                </NavLink>
                                            </div>
                                            <Dropdown className='user_dropdown'>
                                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                    <img width={"32px"} src={`data:image/svg+xml;utf8,${generateFromString(owner || "")}`} />
                                                    <svg className='more-icon' xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M10.4419 14.0669C10.1979 14.311 9.80214 14.311 9.55806 14.0669L3.30806 7.81694C3.06398 7.57286 3.06398 7.17714 3.30806 6.93306C3.55214 6.68898 3.94786 6.68898 4.19194 6.93306L10 12.7411L15.8081 6.93306C16.0521 6.68898 16.4479 6.68898 16.6919 6.93306C16.936 7.17714 16.936 7.57286 16.6919 7.81694L10.4419 14.0669Z" fill="#F3F4D4" />
                                                    </svg>
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu className="dropdown-menu">
                                                    <Dropdown.Item className='d-flex'>
                                                        <NavLink to="/myprofile">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M15.7501 6C15.7501 8.07107 14.0712 9.75 12.0001 9.75C9.92902 9.75 8.25009 8.07107 8.25009 6C8.25009 3.92893 9.92902 2.25 12.0001 2.25C14.0712 2.25 15.7501 3.92893 15.7501 6Z" stroke="#F8F8E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M4.50122 20.1182C4.57153 16.0369 7.90196 12.75 12.0001 12.75C16.0983 12.75 19.4288 16.0371 19.499 20.1185C17.2162 21.166 14.6765 21.75 12.0004 21.75C9.32408 21.75 6.78418 21.1659 4.50122 20.1182Z" stroke="#F8F8E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span>My profile</span>
                                                        </NavLink>
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item className='d-flex'>
                                                        <NavLink to="/settings" className='animated-line'>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M12.22 2H11.78C11.2496 2 10.7409 2.21071 10.3658 2.58579C9.99072 2.96086 9.78 3.46957 9.78 4V4.18C9.77964 4.53073 9.68706 4.87519 9.51154 5.17884C9.33602 5.48248 9.08374 5.73464 8.78 5.91L8.35 6.16C8.04596 6.33554 7.70108 6.42795 7.35 6.42795C6.99893 6.42795 6.65404 6.33554 6.35 6.16L6.2 6.08C5.74107 5.81526 5.19584 5.74344 4.684 5.88031C4.17217 6.01717 3.73555 6.35154 3.47 6.81L3.25 7.19C2.98526 7.64893 2.91345 8.19416 3.05031 8.706C3.18717 9.21783 3.52154 9.65445 3.98 9.92L4.13 10.02C4.43228 10.1945 4.68362 10.4451 4.85905 10.7468C5.03448 11.0486 5.1279 11.391 5.13 11.74V12.25C5.1314 12.6024 5.03965 12.949 4.86405 13.2545C4.68844 13.5601 4.43521 13.8138 4.13 13.99L3.98 14.08C3.52154 14.3456 3.18717 14.7822 3.05031 15.294C2.91345 15.8058 2.98526 16.3511 3.25 16.81L3.47 17.19C3.73555 17.6485 4.17217 17.9828 4.684 18.1197C5.19584 18.2566 5.74107 18.1847 6.2 17.92L6.35 17.84C6.65404 17.6645 6.99893 17.5721 7.35 17.5721C7.70108 17.5721 8.04596 17.6645 8.35 17.84L8.78 18.09C9.08374 18.2654 9.33602 18.5175 9.51154 18.8212C9.68706 19.1248 9.77964 19.4693 9.78 19.82V20C9.78 20.5304 9.99072 21.0391 10.3658 21.4142C10.7409 21.7893 11.2496 22 11.78 22H12.22C12.7504 22 13.2591 21.7893 13.6342 21.4142C14.0093 21.0391 14.22 20.5304 14.22 20V19.82C14.2204 19.4693 14.3129 19.1248 14.4885 18.8212C14.664 18.5175 14.9163 18.2654 15.22 18.09L15.65 17.84C15.954 17.6645 16.2989 17.5721 16.65 17.5721C17.0011 17.5721 17.346 17.6645 17.65 17.84L17.8 17.92C18.2589 18.1847 18.8042 18.2566 19.316 18.1197C19.8278 17.9828 20.2645 17.6485 20.53 17.19L20.75 16.8C21.0147 16.3411 21.0866 15.7958 20.9497 15.284C20.8128 14.7722 20.4785 14.3356 20.02 14.07L19.87 13.99C19.5648 13.8138 19.3116 13.5601 19.136 13.2545C18.9604 12.949 18.8686 12.6024 18.87 12.25V11.75C18.8686 11.3976 18.9604 11.051 19.136 10.7455C19.3116 10.4399 19.5648 10.1862 19.87 10.01L20.02 9.92C20.4785 9.65445 20.8128 9.21783 20.9497 8.706C21.0866 8.19416 21.0147 7.64893 20.75 7.19L20.53 6.81C20.2645 6.35154 19.8278 6.01717 19.316 5.88031C18.8042 5.74344 18.2589 5.81526 17.8 6.08L17.65 6.16C17.346 6.33554 17.0011 6.42795 16.65 6.42795C16.2989 6.42795 15.954 6.33554 15.65 6.16L15.22 5.91C14.9163 5.73464 14.664 5.48248 14.4885 5.17884C14.3129 4.87519 14.2204 4.53073 14.22 4.18V4C14.22 3.46957 14.0093 2.96086 13.6342 2.58579C13.2591 2.21071 12.7504 2 12.22 2Z" stroke="#F8F8E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#F8F8E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span>Settings</span>
                                                        </NavLink>
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item className='d-flex'>
                                                        <NavLink className='animated-line' onClick={() => {
                                                            disconnect({ label: wallet.label });
                                                            setProvider(null);
                                                            setWrongChain(false);
                                                            setShown(false);
                                                            setActiveContract(null);
                                                            setUSDCBalance(null);
                                                            localStorage.removeItem('activeContract')
                                                        }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#F8F8E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M16 17L21 12L16 7" stroke="#F8F8E5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M21 12H9" stroke="#F8F8E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <span>Logout</span>
                                                        </NavLink>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>

                                            {/*
                                            <motion.div
                                                onHoverStart={() => setShown(true)}
                                                onHoverEnd={() => setShown(false)}
                                            >

                                                <div className="wallet_address">
                                                    <div className="">
                                                        <span>{formatAddress(wallet?.accounts[0]?.address)}</span>
                                                        <i className="bi bi-person"></i>
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
                                                        <button className='wallet_deposit'>
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

                                                    <NavDropdown.Divider />

                                                    <button onClick={() => {
                                                        disconnect({ label: wallet.label });
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
                                            */}

                                        </>
                                    )}
                                </div>
                            </div>


                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </header>
        </>
    )
}

