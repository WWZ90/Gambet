import React, {useEffect, useState, useRef} from 'react'

import {motion} from "framer-motion";

import {NavLink, useNavigate} from "react-router-dom";

import {useConnectWallet, useSetChain} from "@web3-onboard/react";
import {ethers} from "ethers";
import {Presets, Client} from "userop"

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

    const gasslessAddress = async (rpcUrl, signer) => {
        if (!signer) {
            return null;
        }
        const paymasterUrl = "https://api.stackup.sh/v1/paymaster/7daadcaada371e09de5519d2522bbe7691554adbf8cf2869c6dbbaedb90633bb";
        const paymasterContext = {type: "payg"};
        const opts = {
            paymasterMiddleware: Presets.Middleware.verifyingPaymaster(
                paymasterUrl,
                paymasterContext
            )
        }
        const builder = await Presets.Builder.SimpleAccount.init(signer, rpcUrl, opts);
        const address = builder.getSender();
        console.log(`Account address: ${address}`);
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
            amounts: parameters[0].filter((e,i) => parameters[2][i] === 0n),
            prices: parameters[1].filter((e,i) => parameters[2][i] === 0n)
        }
        for (let i = 0; i < buys.amounts.length; i++) {
            cost += buys.amounts[i] * (buys.prices[i] || 1e6);
        }
        console.log("Cost is", cost);
        return cost;
    }

    const gaslessTransaction = async (contract, prop, args) => {
        if (!signer || !contract || !owner) {
            console.error("Missing required signer/contract", signer, contract);
            return;
        }
        console.log(prop, args);
        const rpcUrl = "https://public.stackup.sh/api/v1/node/polygon-mumbai";
        const [, builder] = await gasslessAddress(rpcUrl, signer);
        // Encode the calls
        const callTo = [import.meta.env.VITE_USDC_ADDRESS, await contract.getAddress()];
        const costCalculator = {
            "fillOrder": calculateCostForFillOrder,
            "createOptimisticBet": calculateCostForOptimisticBet
        }
        const cost = costCalculator[prop](args);
        console.log(import.meta.env.VITE_OO_CONTRACT_ADDRESS, owner);
        debugger;
        const callData = [
            usdc.interface.encodeFunctionData("approve", [import.meta.env.VITE_OO_CONTRACT_ADDRESS, cost]),
            contract.interface.encodeFunctionData(prop, args)
        ];
        await usdc.transfer(owner, cost).then(tx => tx.wait());
        // Send the User Operation to the ERC-4337 mempool
        const client = await Client.init(rpcUrl);
        const res = await client.sendUserOperation(builder.executeBatch(callTo, callData), {
            onBuild: (op) => console.log("Signed UserOperation:", op),
        });

        // Return receipt
        console.log(`UserOpHash: ${res.userOpHash}`);
        console.log("Waiting for transaction...");
        const ev = await res.wait();
        console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
        console.log(`View here: https://jiffyscan.xyz/userOpHash/${res.userOpHash}`);
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
                                    const body = JSON.stringify({
                                        name: filter?.fragment?.name || filter[0],
                                        topics: filter[1]?.map ? filter[1] : [null, null, null]
                                    });
                                    console.log("Querying filter", prop, [...arguments], body);
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
                        let originalReturn = Reflect.get(target, prop, receiver);
                        originalReturn = originalReturn?.catch?.(async error => {
                            return originalReturn.catch(async error => {
                                console.error("Error calling injected wallet promise, trying backend fallback handler: ", error);
                                return handleWalletCall(prop);
                            }).then(r => r === undefined ? handleWalletCall(prop) : r);
                        }) || originalReturn;

                        if (originalReturn?.constructor?.name === "AsyncFunction") {
                            console.log("Original return is an async function, adding fallback logic to it", prop, originalReturn, connectedContract);
                            return async function () {
                                try {
                                    const r = writeOps.includes(prop) ? await handleWalletCall(prop)(...arguments) : await connectedContract?.[prop]?.(...arguments);
                                    if (r === undefined && !writeOps.includes(prop)) {
                                        return handleWalletCall(prop)(...arguments);
                                    }
                                    return r;
                                } catch (error) {
                                    const r = await handleWalletCall(prop)(...arguments);
                                    console.error("Error calling injected wallet async function, trying backend fallback handler: ", error, prop, originalReturn, r, [...arguments]);
                                    return r;
                                }
                            }
                        } else if (originalReturn === undefined) {
                            const fallback = handleWalletCall(prop);
                            console.log("Original return is undefined, using fallback", prop, fallback, connectedContract);
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
            gasslessAddress(rpcUrl, tempSigner).then(([owner]) => {
                console.log("Owner is " + owner);
                setOwner(owner);
            });
            setUSDC(tempUsdc);
            return tempActiveContract;
        }

        start().catch(err => {
            console.error(err);
            return null;
        }).then(setupActiveContract);

    }, [provider])

    const handleConnectWallet = async () => {
        await connect();
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
                    to Polygon-Mumbai</button></div>
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
