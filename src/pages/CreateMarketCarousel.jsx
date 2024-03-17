import React, { useEffect, useState, useRef } from 'react'

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { useStateContext } from '../contexts/ContextProvider';

import { createBet, verifyMarketExist } from '../utils/services';

import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'
import { Footer } from '../components/Footer'

import { Button } from '../components/Button'

import ImageUploading from "react-images-uploading";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import pointing_left from "../assets/icons/png/noto_backhand-index-pointing-left.png";
import pointing_right from "../assets/icons/png/noto_backhand-index-pointing-right.png";
import check from "../assets/icons/png/check.png";
import upload from '../assets/img/image_upload_2.png';

export const CreateMarketCarousel = () => {
    const outcomeInputRef = useRef();

    const { activeContract } = useStateContext();
    const { usdc } = useStateContext();
    const { usdcBalance, setUSDCBalance } = useStateContext();
    const { awaitingApproval, setAwaitingApproval } = useStateContext();
    const { owner } = useStateContext();
    const { betType } = useStateContext();

    const [betID, setBetID] = useState()
    const [betSchema, setBetSchema] = useState()
    const [betOOTitle, setBetOOTitle] = useState()
    const [betOO, setBetOO] = useState()
    const [betChoice, setBetChoice] = useState()
    const [betChoiceList, setBetChoiceList] = useState([])
    const [idBetChoice, setIdBetChoice] = useState(0)
    const [betInitialPool, setBetInitialPool] = useState(0);
    const [betCommission, setBetCommission] = useState(0);

    const [dateLocked, setDateLocked] = useState(new Date());
    const [dateDeadline, setDateDeadline] = useState(new Date());

    const [totalCost, setTotalCost] = useState(0);
    const [minimumInitialPool, setMinimumInitialPool] = useState(0);
    const [percentageError, setPercentageError] = useState('');

    const [marketImage, setMarketImage] = useState([]);

    const [marketIDExist, setMarketIDExist] = useState(false);
    const [marketIdError, setMarketIdError] = useState(false);
    const [marketNameError, setMarketNameError] = useState(false);
    const [marketTermsError, setMarketTermsError] = useState(false);
    const [marketOutcomesError, setMarketOutcomesError] = useState(false);
    const [marketOutcomesHandleBlur, setMarketOutcomesHandleBlur] = useState(false);

    const [{ connecting }, connect] = useConnectWallet();

    const handleBlur = (field, value) => {
        if (!value) {
            switch (field) {
                case 'marketId':
                    setMarketIdError(true);
                    break;
                case 'marketName':
                    setMarketNameError(true);
                    break;
                case 'marketTerms':
                    setMarketTermsError(true);
                    break;
                case 'marketOutcomes':
                    betChoiceList.length < 2 ? setMarketOutcomesError(true) : setMarketOutcomesError(false);
                    setMarketOutcomesHandleBlur(true);
                    break;
                default:
                    break;
            }
        }
    };

    const handleChangeBetID = async (event) => {
        const mID = event.target.value;

        setBetID(mID);

        if (mID) {
            setMarketIdError(false);
            await verifyMarketExist(mID, activeContract).then((result) => {
                if (result) {
                    setMarketIDExist(true);
                } else {
                    setMarketIDExist(false);
                }
            })
        }

    }

    const handleChangeBetSchema = (event) => {
        setBetSchema(event.target.value)
    }

    const handleChangeBetOOTitle = (event) => {
        const mName = event.target.value;
        setBetOOTitle(mName);

        if (mName) {
            setMarketNameError(false);
        }
    }

    const handleChangeBetOO = (event) => {
        const mTerms = event.target.value;
        setBetOO(mTerms);

        if (mTerms) {
            setMarketTermsError(false);
        }
    }

    const handleChangeBetChoice = (event) => {
        setBetChoice(event.target.value);
    }

    const handleOutcomesOnKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddBetChoice();
        }
    }

    const handleAddBetChoice = () => {
        //debugger;
        if (betChoice) {
            if (!betChoiceList.some(item => item.betChoice === betChoice)) {
                setBetChoiceList([...betChoiceList, { id: idBetChoice, image: undefined, betChoice, percentage: 0 }]);
                setIdBetChoice(idBetChoice + 1);
                setBetChoice('');
                outcomeInputRef.current.focus();
                checkPercentageSum(betChoiceList);
            }
        }
    }

    useEffect(() => {
        if (marketOutcomesHandleBlur)
            betChoiceList.length < 2 ? setMarketOutcomesError(true) : setMarketOutcomesError(false);
    }, [betChoiceList])


    const handleImageUpload = (image, id) => {
        // Filtra las imágenes para mantener solo la última (la más reciente)
        // De no hacerse de esta forma, cuando se ponian mas outcomes, el array de image crecia, imagen en 0 siempre la primera q se puso, y en la ultima pos la actualizada
        const updatedImage = image.slice(-1);

        const updatedList = betChoiceList.map((betChoice) =>
            betChoice.id === id ? { ...betChoice, image: updatedImage } : betChoice
        );
        setBetChoiceList(updatedList);
    };

    const handleImageRemove = (id) => {
        const updatedList = betChoiceList.map((item) => {
            if (item.id === id) {
                return { ...item, image: null };
            }
            return item;
        });
        setBetChoiceList(updatedList);
    };

    const handleDeleteBetChoice = (id) => {

        const newBetChoiceList = betChoiceList.filter((item) => item.id !== id);

        setBetChoiceList(newBetChoiceList);

        checkPercentageSum(newBetChoiceList);
    }

    const handlePercentageChange = (id, percentage) => {

        const newValue = parseInt(percentage, 10);
        percentage = newValue < 0 ? 0 : newValue;

        const newBetChoiceList = betChoiceList.map((item) => {
            if (item.id === id) {
                return { ...item, percentage };
            }
            return item;
        });

        setBetChoiceList(newBetChoiceList);
        checkPercentageSum(newBetChoiceList);
    }

    const checkPercentageSum = (list) => {

        const sum = list.reduce((total, item) => total + parseFloat(item.percentage), 0);

        if (list.length >= 0) {
            if (sum !== 100) {
                setPercentageError('The sum of all the % has to be 100');
            } else {
                setPercentageError('');
            }
        }
    }

    useEffect(() => {
        renderCostMessage();
    }, [betChoiceList])


    const renderCostMessage = () => {
        const ratios = betChoiceList.map(item => item.percentage).map(Number).filter(v => v);
        const mIP = !Math.min(...ratios) ? 0 : Math.ceil(100 / Math.min(...ratios));

        if (mIP != minimumInitialPool) {
            setMinimumInitialPool(mIP);
            setBetInitialPool(mIP);
        }

        const actualIP = betInitialPool > mIP ? betInitialPool : mIP;

        const totalCost = (10 + Math.sqrt(ratios.map(p => actualIP / 100 * p).map(o => o * o).reduce((a, b) => a + b, 0))).toFixed(2);

        setTotalCost(totalCost);
    }

    const handleChangeInitialPool = (event) => {
        setBetInitialPool(Number(event.target.value));
    }

    const handleIncrementInitialPool = () => {
        setBetInitialPool(Number(betInitialPool + minimumInitialPool));
    };

    const handleDecrementInitialPool = () => {
        if (betInitialPool >= minimumInitialPool) {
            setBetInitialPool(Number(betInitialPool - minimumInitialPool));
        }
    };

    useEffect(() => {
        renderCostMessage();
    }, [betInitialPool])



    const handleChangeCommission = (event) => {
        setBetCommission(event.target.value);
    }

    const handleDateLockedChange = (date) => {
        setDateLocked(date);
        if (dateDeadline < date) {
            setDateDeadline(date);
        }
    }

    const handleDateDeadlineChange = (date) => {
        setDateDeadline(date);
    }

    const handleOnChangeMarketImage = (image) => {
        setMarketImage(image);
    };

    const handleImageSubmission = (image) => {
        const formData = new FormData();

        formData.append('image', image);

        return fetch(
            `https://cors-anywhere.herokuapp.com/https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOST}`,
            {
                method: 'POST',
                body: formData,
            }
        )
    };

    const handleConnectWallet = async () => {
        await connect().then(async (result) => {
            await handleDepositUSDC();
        })
    }

    const handleDepositUSDC = async () => {
        setAwaitingApproval(true);
        try {
            let balance = await usdc.balanceOf(owner);
            let approvalTx = await usdc.approve(import.meta.env.VITE_OO_CONTRACT_ADDRESS, balance);
            await approvalTx.wait();
            balance = await usdc.balanceOf(owner);
            let allowance = usdc.allowance(owner, import.meta.env.VITE_OO_CONTRACT_ADDRESS);
            const walletBalance = balance > allowance ? allowance : balance;
            let b = (Number(walletBalance) / 1e6).toFixed(3);
            setUSDCBalance(b);
            setAwaitingApproval(false);
        } catch {
            setAwaitingApproval(false);
        }
    }

    const handleCreateMarket = async () => {
        const uploadOutcomeImages = async () => {
            const outcomeImagePromises = betChoiceList.map(async (item) => {
                if (item.image === null || item.image === undefined) {
                    return "";
                }

                //debugger;

                const outcomeImageResponse = await handleImageSubmission(item.image[0].file);
                const outcomeImageResult = await outcomeImageResponse.json();

                return outcomeImageResult.data.thumb.url;
            });

            return Promise.all(outcomeImagePromises);
        };

        try {
            let marketImageURL = "";

            if (marketImage.length > 0) {
                const marketImageResponse = await handleImageSubmission(marketImage[0].file);
                const marketImageResult = await marketImageResponse.json();
                marketImageURL = marketImageResult.data.thumb.url;
            }

            const outcomesImagesArray = await uploadOutcomeImages();

            const outcomesArray = betChoiceList.map((item) => item.betChoice);
            const percentageArray = betChoiceList.map((item) => Number(item.percentage));

            await createBet(
                activeContract,
                usdc,
                owner,
                import.meta.env.VITE_OO_CONTRACT_ADDRESS,
                betType,
                import.meta.env.VITE_USDC_ADDRESS,
                betID,
                dateLocked,
                dateDeadline,
                Number(betInitialPool),
                outcomesArray,
                percentageArray,
                betOOTitle,
                betOO,
                marketImageURL,
                outcomesImagesArray
            ).then((r) => {
                console.log(r);
            });
        } catch (error) {
            console.error('Error:', error);
        }

        /*
        handleImageSubmission(marketImage[0].file)
          .then((response) => response.json())
          .then(async (result) => {
            const marketImage = result.data.thumb.url;
    
            //TODO: Subir las imagenes de los outcomes.
    
            const outcomesArray = betChoiceList.map(item => item.betChoice);
            const percentageArray = betChoiceList.map(item => Number(item.percentage));
            const outcomesImagesArray = betChoiceList.map(item => item.image === null || item.image === undefined ? "" : item.image);
    
            await createBet(activeContract, usdc, owner, import.meta.env.VITE_OO_CONTRACT_ADDRESS, betType, import.meta.env.VITE_USDC_ADDRESS, betID, dateLocked, dateDeadline, Number(betInitialPool), outcomesArray, percentageArray, betOOTitle, betOO, marketImage, outcomesImagesArray).then((r) => {
              console.log(r);
            });
    
          })
          .catch((error) => {
            console.error('Error:', error);
          });
        */
    }


    /* Paginate */

    const [pageIndex, setPageIndex] = useState(1);

    const handlePrev = () => {
        if (pageIndex > 1)
            setPageIndex(pageIndex - 1);
    }

    const handleNext = () => {
        if (pageIndex < 7)
            setPageIndex(pageIndex + 1);
    }

    const renderFormPage = () => {
        switch (pageIndex) {
            case 1:
                return (
                    <div className='form-page'>
                        <p className='h3_medium'>What's your Market ID?</p>
                        <p className='body_2'>Market ID is Lorem ipsum dolor sit amet consectetur. At rutrum scelerisque in justo purus posuere mauris. Sed ut posuere eu et. Cursus dictum risus massa sit nibh sed. </p>
                        <div className="forms">
                            <Form.Control
                                type="text"
                                id="create-bet-id"
                                value={betID}
                                placeholder="argentina-2023"
                                aria-describedby="create-bet-id-HelpBlock"
                                className={(marketIDExist || marketIdError) ? "elegant_input input_error" : "elegant_input"}
                                onChange={handleChangeBetID}
                                onBlur={() => handleBlur('marketId', betID)}
                            />
                            {marketIDExist && (
                                <p className='text_error'>This market id already exist</p>
                            )}

                            {marketIdError && (
                                <p className='text_error'>This field is required</p>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className='form-page'>
                        <p className='h3_medium'>Give your market a name!</p>
                        <p className='body_2'>Market name is Lorem ipsum dolor sit amet consectetur. At rutrum scelerisque in justo purus posuere mauris. Sed ut posuere eu et. Cursus dictum risus massa sit nibh sed. </p>
                        <div className="forms">
                            <Form.Control
                                type="text"
                                id="create-bet-oo-title"
                                value={betOOTitle}
                                placeholder="For example: Argentina's Presidential Elections"
                                className={(marketNameError) ? "elegant_input input_error" : "elegant_input"}
                                onChange={handleChangeBetOOTitle}
                                onBlur={() => handleBlur('marketName', betOOTitle)}
                            />

                            {marketNameError && (
                                <p className='text_error'>This field is required</p>
                            )}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className='form-page'>
                        <div className='form-page'>
                            <p className='h3_medium'>Set up the terms for your market</p>
                            <p className='body_2'>Market terms is Lorem ipsum dolor sit amet consectetur. At rutrum scelerisque in justo purus posuere mauris. Sed ut posuere eu et. Cursus dictum risus massa sit nibh sed. </p>
                            <div className="forms">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    id="create-bet-oo"
                                    value={betOO}
                                    placeholder="This market will resolve to the winning candidate for Argentina's 2023 Presidential Elections"
                                    className={(marketTermsError) ? "elegant_input input_error" : "elegant_input"}
                                    onChange={handleChangeBetOO}
                                    onBlur={() => handleBlur('marketTerms', betOO)}
                                />

                                {marketTermsError && (
                                    <p className='text_error'>This field is required</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className='form-page'>
                        <div className='form-page'>
                            <div className='form-page'>
                                <p className='h3_medium'>Upload your market’s image</p>
                                <div className="forms">
                                    <div className="form_rect_img odd">
                                        <div className="img">
                                            <img src={upload}/>
                                        </div>
                                        <div className="body_2">
                                            Drop your image here, or <span>browse</span>
                                        </div>
                                        <div className="body_small">Supports: PNG, JPG, JPEG, WEBP</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className='form-page'>
                        {/* Contenido de la quinta página */}
                    </div>
                );
            case 6:
                return (
                    <div className='form-page'>
                        {/* Contenido de la sexta página */}
                    </div>
                );
            case 7:
                return (
                    <div className='form-page'>
                        {/* Contenido de la séptima página */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="image-back">
                <NavBarWeb3Onboard />

                <div className='create-market-carousel-top'>
                    <div className="container">
                        <div className="title">
                            <p className='h2_medium'>Create a <span className='h2_bold'>new market</span></p>
                        </div>
                    </div>
                </div>
                <div className='create-market-carousel carousel-form-all'>
                    <div className="container">
                        <div className="d-flex align-items-center justify-content-center">
                            <div className="text-center text-white carousel-form">

                                {renderFormPage()}

                                <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                                    {pageIndex > 1 ?
                                        <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                                        :
                                        <></>
                                    }
                                    <Button text='Continue' iconSrc={pointing_right} backgroundColor='#6E6EEA' style={{ width: "184px" }} onClick={handleNext} />
                                </div>
                                <div className="pages">
                                    <a className={`${pageIndex == 1 ? 'active' : ''}`}>
                                        {pageIndex <= 1 ? "1" : <img src={check} />}
                                    </a>
                                    <a className={`${pageIndex == 2 ? 'active' : ''}`}>
                                        {pageIndex <= 2 ? "2" : <img src={check} />}
                                    </a>
                                    <a className={`${pageIndex == 3 ? 'active' : ''}`}>
                                        {pageIndex <= 3 ? "3" : <img src={check} />}
                                    </a>
                                    <a className={`${pageIndex == 4 ? 'active' : ''}`}>
                                        {pageIndex <= 4 ? "4" : <img src={check} />}
                                    </a>
                                    <a className={`${pageIndex == 5 ? 'active' : ''}`}>
                                        {pageIndex <= 5 ? "5" : <img src={check} />}
                                    </a>
                                    <a className={`${pageIndex == 6 ? 'active' : ''}`}>
                                        {pageIndex <= 6 ? "6" : <img src={check} />}
                                    </a>
                                    <a className={`${pageIndex == 7 ? 'active' : ''}`}>
                                        {pageIndex <= 7 ? "7" : <img src={check} />}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div >
        </>
    )
}
