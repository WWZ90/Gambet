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
import plus from '../assets/icons/png/plus.png';
import trash from "../assets/icons/png/trash.png";
import subtract from "../assets/icons/png/-.png";
import add from "../assets/icons/png/+.png";
import party from "../assets/icons/png/noto_party-popper.png";
import rocket from '../assets/icons/png/noto_rocket.png';

export const CreateMarketCarousel = () => {
    const outcomeInputRef = useRef();

    const { activeContract } = useStateContext();
    const { usdc } = useStateContext();
    const { usdcBalance, setUSDCBalance } = useStateContext();
    const { awaitingApproval, setAwaitingApproval } = useStateContext();
    const { owner } = useStateContext();
    const { betType } = useStateContext();

    const [betID, setBetID] = useState("");
    const [betSchema, setBetSchema] = useState();
    const [betOOTitle, setBetOOTitle] = useState("");
    const [betOO, setBetOO] = useState("");
    const [betChoice, setBetChoice] = useState("");
    const [betChoiceList, setBetChoiceList] = useState([])
    const [idBetChoice, setIdBetChoice] = useState(0);
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
    const [imageError, setImageError] = useState(false);
    const [marketTermsError, setMarketTermsError] = useState(false);
    const [marketOutcomesError, setMarketOutcomesError] = useState(false);
    const [marketOutcomeExists, setMarketOutcomeExists] = useState(false);
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
        setMarketOutcomeExists(false);
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
            } else {
                setMarketOutcomeExists(true);
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

        if (percentage.length == 0)
            percentage = 0;

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
                setPercentageError('Please note that the sum of all the % has to be 100');
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
        console.log('okok');
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
        await connect()
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

    const [imageUrl, setImageUrl] = useState('');

    const handleImageUrlChange = (event) => {
        setImageUrl(event.target.value);
    };

    const handleImportFromUrl = () => {
        setImageError(false);
        const img = new Image();
        img.src = imageUrl;

        img.onload = () => {
            setMarketImage([...marketImage, { data_url: imageUrl }]);
            setImageUrl('');
        };

        img.onerror = () => {
            setImageError(true);
        };
    };

    const renderFormPage = () => {
        switch (pageIndex) {
            case 1:
                return (
                    <>
                        <div className='form-page'>
                            <p className='h3_medium'>What’s your Market ID?</p>
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

                        <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                            {pageIndex > 1 ?
                                <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                                :
                                <></>
                            }
                            <Button text='Continue' iconSrc={pointing_right} backgroundColor='#6E6EEA' style={{ width: "184px" }} disabled={marketIDExist || marketIdError || betID.length == 0} onClick={handleNext} />
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
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

                        <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                            {pageIndex > 1 ?
                                <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                                :
                                <></>
                            }
                            <Button text='Continue' iconSrc={pointing_right} backgroundColor='#6E6EEA' style={{ width: "184px" }} disabled={marketNameError || betOOTitle.length == 0} onClick={handleNext} />
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
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

                        <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                            {pageIndex > 1 ?
                                <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                                :
                                <></>
                            }
                            <Button text='Continue' iconSrc={pointing_right} backgroundColor='#6E6EEA' style={{ width: "184px" }} disabled={marketTermsError || betOO.length == 0} onClick={handleNext} />
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className='form-page'>
                            <p className='h3_medium'>Upload your market’s image</p>
                            <div className="forms">

                                <ImageUploading
                                    multiple
                                    value={marketImage}
                                    onChange={handleOnChangeMarketImage}
                                    maxNumber='1'
                                    dataURLKey="data_url"
                                    acceptType={["jpg", "jpeg", "png", "webp"]}
                                    style={{
                                        width: '100%', // Hacer que ImageUploading abarque todo el ancho del contenedor
                                        height: '100%', // Hacer que ImageUploading abarque toda la altura del contenedor
                                    }}
                                >
                                    {({
                                        image,
                                        onImageUpload,
                                        onImageUpdate,
                                        onImageRemove,
                                        isDragging,
                                        dragProps
                                    }) => (
                                        <div className={`form_rect_img ${isDragging ? 'upload__image-wrapper dragging' : 'upload__image-wrapper'}`}

                                            {...dragProps}
                                        >
                                            {!marketImage.length ? (
                                                <>
                                                    <div className="upload_image">
                                                        <img
                                                            alt=""
                                                            width="100"
                                                            src={upload}
                                                            style={isDragging ? { color: "red" } : null}
                                                        />
                                                        <div className="overlay" onClick={onImageUpdate}>
                                                            <i className="bi bi-cloud-arrow-up"></i>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                marketImage.map((image, index) => (
                                                    <div key={index} className="image-item upload_image">
                                                        <img src={image.data_url} alt="" width="100" />
                                                        <div className="overlay">
                                                            <i className="bi bi-cloud-arrow-up" onClick={() => onImageUpdate(index)} ></i>
                                                            <img src={trash} className='trash' onClick={() => onImageRemove(index)} />
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            <div className="body_2 mb-1">
                                                Drop your image here, or <span onClick={() => onImageUpdate(0)} style={{ textDecoration: "underline", color: "#EE8C71" }}>browse</span>
                                            </div>
                                            <div className="body_small">Supports: PNG, JPG, JPEG, WEBP</div>
                                        </div>
                                    )}
                                </ImageUploading>

                                <div className="line-with-or">
                                    <span className="line"></span>
                                    <span className="body_small or">or</span>
                                    <span className="line"></span>
                                </div>

                                <p className='body_1 mb-2'>Import from URL</p>
                                <Form.Control
                                    className='elegant_input w-100'
                                    type="text"
                                    value={imageUrl}
                                    onChange={handleImageUrlChange}
                                />
                                {imageError && (
                                    <p className='text_error'>The url does not contain a valid image</p>
                                )}
                                <div className="d-flex justify-content-end mt-3">
                                    <Button text="Upload" cName="terciary" style={{ width: "184px" }} disabled={!imageUrl} onClick={handleImportFromUrl} />
                                </div>
                            </div>

                        </div>

                        <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                            {pageIndex > 1 ?
                                <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                                :
                                <></>
                            }
                            <Button text='Continue' iconSrc={pointing_right} backgroundColor='#6E6EEA' style={{ width: "184px" }} disabled={marketTermsError || betOO.length == 0} onClick={handleNext} />
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <div className='form-page'>
                            <p className='h3_medium'>What’s your outcome?</p>
                            <p className='body_2'>Lorem ipsum dolor sit amet consectetur. At rutrum scelerisque in justo purus posuere mauris. Sed ut posuere eu et. Cursus dictum risus massa sit nibh sed. </p>
                            <div className="forms">
                                <div className="d-flex justify-content-between add_outcome">
                                    <Form.Control
                                        type="text"
                                        className="elegant_input"
                                        id="create-bet-choice"
                                        placeholder="Write an outcome"
                                        value={betChoice}
                                        onChange={handleChangeBetChoice}
                                        onBlur={() => handleBlur('marketOutcomes', betChoice)}
                                        onKeyDown={handleOutcomesOnKeyDown}
                                        ref={outcomeInputRef}
                                    />
                                    <Button text="Add" cName="terciary" iconSrc={plus} style={{ width: "120px" }} disabled={!betChoice} onClick={handleAddBetChoice} />
                                </div>
                                {marketOutcomeExists && (
                                    <p className='text_error'>That outcome already exists</p>
                                )}
                            </div>

                            {betChoiceList.length > 0 && (
                                <>
                                    <div className="outcomes_box mt-2 align-middle body_3">
                                        <div className="row header_row">
                                            <div className='col-2 text-start'>Image</div>
                                            <div className='col-6 text-start'>Outcome</div>
                                            <div className='col-2 text-center'>%</div>
                                            <div className='col-2 text-center'></div>

                                        </div>
                                        {betChoiceList.map((item) => (
                                            <div key={item.id} className='row align-middle outcome_row'>
                                                <div className='col-2 text-start'>
                                                    <ImageUploading
                                                        value={item.image}
                                                        onChange={(image) => handleImageUpload(image, item.id)}
                                                        dataURLKey="data_url"
                                                        acceptType={["jpg", "gif", "png"]}
                                                    >
                                                        {({
                                                            image,
                                                            onImageUpload,
                                                            onImageUpdate,
                                                            onImageRemove,
                                                            isDragging,
                                                            dragProps
                                                        }) => (
                                                            // write your building UI
                                                            <div className="upload__image-wrapper">
                                                                {!item.image ? (
                                                                    <>
                                                                        <div className="upload_image">
                                                                            <img alt="" src={upload} style={isDragging ? { color: "red" } : null}
                                                                                {...dragProps}>
                                                                            </img>
                                                                            <div className="overlay" onClick={onImageUpdate}>
                                                                                <i className="bi bi-cloud-arrow-up"></i>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (

                                                                    <div className="my-auto image-item upload_image">
                                                                        <img src={item.image[0].data_url} alt="" width="70" />
                                                                        <div className="overlay">
                                                                            <i className="bi bi-cloud-arrow-up" onClick={() => onImageUpdate(item.id)} ></i>
                                                                            <img src={trash} className='trash' onClick={() => onImageRemove(index)} />
                                                                        </div>
                                                                    </div>

                                                                )}
                                                            </div>
                                                        )}
                                                    </ImageUploading >

                                                </div>
                                                <div className='col-6 my-auto text-start'>{item.betChoice}</div>
                                                <div className='col-2 my-auto'>
                                                    <Form.Control
                                                        type="text"
                                                        className='elegant_input'
                                                        style={{ width: '75px' }}
                                                        value={item.percentage}
                                                        onChange={(e) => handlePercentageChange(item.id, e.target.value)}
                                                    />
                                                </div>
                                                <div className='col-2 my-auto text-end'>
                                                    <img src={trash} className='trash' onClick={() => handleDeleteBetChoice(item.id)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {percentageError && (
                                        <Alert variant="danger">
                                            {percentageError}
                                        </Alert>
                                    )}

                                    {betChoiceList.length < 2 && (
                                        <Alert variant="danger">
                                            <span>At least need 2 outcomes</span>
                                        </Alert>
                                    )}
                                </>
                            )}

                        </div>
                        <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                            {pageIndex > 1 ?
                                <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                                :
                                <></>
                            }
                            <Button text='Continue' iconSrc={pointing_right} backgroundColor='#6E6EEA' style={{ width: "184px" }} disabled={percentageError || betChoiceList.length < 2} onClick={handleNext} />
                        </div>
                    </>
                );
            case 6:
                return (
                    <>
                        <div className='form-page'>
                            <p className='h3_medium'>Choose the initial pool</p>
                            <p className='body_2'>Lorem ipsum dolor sit amet consectetur. At rutrum scelerisque in justo purus posuere mauris. Sed ut posuere eu et. Cursus dictum risus massa sit nibh sed. </p>
                            <div className="forms">

                                <div className='input_style'>

                                    <Button cName="short-icon-button subtract" iconSrc={subtract} disabled={minimumInitialPool >= betInitialPool} onClick={handleDecrementInitialPool} />

                                    <Form.Control
                                        type="text"
                                        className="elegant_input text-center"
                                        disabled={true}
                                        value={minimumInitialPool <= betInitialPool ? betInitialPool : minimumInitialPool}
                                        style={{ flex: 1, border: 'none' }}
                                        onChange={handleChangeInitialPool}
                                    />

                                    <Button cName="short-icon-button add" iconSrc={add} onClick={handleIncrementInitialPool} />
                                </div>
                            </div>

                            <p className='body_m_small'>The market must be bootstrapped with <span className="body_m_small_bold">at least {minimumInitialPool} initial shares</span></p>

                            <p className='d-body_1'>Total cost: <span className='body_1_medium'>{totalCost} USDC</span></p>

                            <p className='body_m_small last'>Internal commission 2%</p>
                        </div>
                        <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                            {pageIndex > 1 ?
                                <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                                :
                                <></>
                            }
                            <Button text='Continue' iconSrc={pointing_right} backgroundColor='#6E6EEA' style={{ width: "184px" }} onClick={handleNext} />
                        </div>
                    </>
                );
            case 7:
                return (
                    <>
                        <div className='form-page text-start'>
                            <p className='h3_medium'>Finally, define dates</p>
                            <p className='body_2'>Lorem ipsum dolor sit amet consectetur. At rutrum scelerisque in justo purus posuere mauris. Sed ut posuere eu et. Cursus dictum risus massa sit nibh sed. </p>
                            <div className="forms">
                                <Form.Label htmlFor="deadline-date">
                                    <p className='h4_medium'>When will the pool be locked?</p>
                                </Form.Label>
                                <div>
                                    <DatePicker
                                        className='elegant_input w-100'
                                        selected={dateLocked}
                                        id="deadline-date"
                                        onChange={handleDateLockedChange}
                                        timeInputLabel="Time:"
                                        dateFormat="MM/dd/yyyy h:mm aa"
                                        showTimeInput
                                        minDate={new Date()}
                                        minTime={new Date(dateLocked)}
                                    />
                                </div>
                                <div>
                                    <Form.Label className='mt-4' htmlFor="deadline-date">
                                        <p className='h4_medium'>What’s the deadline for the market?</p>
                                    </Form.Label>
                                </div>
                                <div>
                                    <DatePicker
                                        className='elegant_input w-100'
                                        selected={dateDeadline}
                                        id="schedule-date"
                                        onChange={handleDateDeadlineChange}
                                        timeInputLabel="Time:"
                                        dateFormat="MM/dd/yyyy h:mm aa"
                                        showTimeInput
                                        minDate={dateLocked}
                                        minTime={new Date(dateLocked).getTime()}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={`d-flex align-items-center ${pageIndex > 1 ? "justify-content-between" : "justify-content-end"} `}>
                            {pageIndex > 1 ?
                                <Button cName="secundary" text='Back' iconSrc={pointing_left} iconOnLeft="true" style={{ border: "2px solid #6E6EEA", width: "184px" }} onClick={handlePrev} />
                                :
                                <></>
                            }

                            {owner ? (
                                (usdcBalance ? (
                                    <Button text='Create' iconSrc={party} backgroundColor='#6E6EEA' style={{ width: "184px" }} onClick={handleCreateMarket} />
                                ) : (
                                    (awaitingApproval ? (
                                        <Button text='Aproving...' iconSrc={party} backgroundColor='#6E6EEA' style={{ width: "184px" }} disabled="true" />
                                    ) : (
                                        <Button text='Aprove USDC' iconSrc={party} backgroundColor='#6E6EEA' style={{ width: "184px" }} />
                                    ))
                                ))
                            ) : (
                                <Button text="Connect" iconSrc={rocket} onClick={handleConnectWallet} backgroundColor="#6F75E5" />
                            )}

                        </div>
                    </>
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

                                <div className="pages">
                                    {[...Array(7).keys()].map((page, index) => (
                                        <a key={index} className={`${pageIndex == page + 1 ? 'active' : ''}`}>
                                            {pageIndex <= page + 1 ? page + 1 : <img src={check} />}
                                        </a>
                                    ))}
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
