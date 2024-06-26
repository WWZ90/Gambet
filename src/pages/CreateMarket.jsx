import React, { useState, useEffect, useRef } from 'react'

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import ImageUploading from "react-images-uploading";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import upload from '../assets/img/image_upload.png';

import { useConnectWallet, useSetChain } from "@web3-onboard/react";

import { useStateContext } from '../contexts/ContextProvider';

import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'
import { Footer } from '../components/Footer'

import { createBet, verifyMarketExist } from '../utils/services';

export const CreateMarket = () => {

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
    await connect();
  }

  const handleCreateMarket = async () => {
    const uploadOutcomeImages = async () => {
      const outcomeImagePromises = betChoiceList.map(async (item) => {
        if (item.image === null || item.image === undefined) {
          return "";
        }

        const outcomeImageResponse = await handleImageSubmission(item.image[0].file);
        const outcomeImageResult = await outcomeImageResponse.json();

        return outcomeImageResult.data.thumb.url;
      });

      return Promise.all(outcomeImagePromises);
    };

    try {
      let marketImageURL = "";

      if(marketImage.length > 0){
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
        //console.log(r);
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

  return (
    <>
      <NavBarWeb3Onboard />

      <section className='create_market' id='create_market' >
        <h1>Create a market</h1>
        <div className="container">
          <div className="create_market_box">

            <Form.Label className='text_yellow' htmlFor="create-bet-id">
              <div className="d-flex">
                <div>Market ID</div>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="button-tooltip-2">Your market's ID is a unique identifier which allows other users to search for it. https://gambeth.com/?id={betID}</Tooltip>}
                >
                  <i className="bi bi-info-circle pl-2"></i>
                </OverlayTrigger>
              </div>
            </Form.Label>

            <Form.Control
              type="text"
              id="create-bet-id"
              value={betID}
              placeholder="argentina-2023"
              aria-describedby="create-bet-id-HelpBlock"
              className={(marketIDExist || marketIdError) ? "input_error" : ""}
              onChange={handleChangeBetID}
              onBlur={() => handleBlur('marketId', betID)}
            />

            {marketIDExist && (
              <p className='text_error'>This market id already exist</p>
            )}

            {marketIdError && (
              <p className='text_error'>This field is required</p>
            )}


            <div className='text_yellow mt-4 mb-2'>Contract Type</div>
            <Form.Select aria-label="Default select example" name='create-bet-schema' id='create-bet-schema' onChange={handleChangeBetSchema}>
              <option className='select_option' value="oo">Optimistic oracle decision</option>
              <option className='select_option' value="bc">Bet creator's decision</option>
              <option className='select_option' value="wa">OoAlpha oracle query</option>
              <option className='select_option' value="xml">XML oracle query</option>
              <option className='select_option' value="json">JSON oracle query</option>
              <option className='select_option' value="html">Process HTML data</option>
            </Form.Select>

            <Form.Label className='text_yellow mt-4' htmlFor="create-bet-oo-title">Market Name</Form.Label>
            <Form.Control
              type="text"
              id="create-bet-oo-title"
              value={betOOTitle}
              placeholder="For example: Argentina's Presidential Elections"
              onChange={handleChangeBetOOTitle}
              onBlur={() => handleBlur('marketName', betOOTitle)}
            />

            {marketNameError && (
              <p className='text_error'>This field is required</p>
            )}

            <Form.Label className='text_yellow mt-4' htmlFor="create-bet-oo">Market Terms</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              id="create-bet-oo"
              value={betOO}
              placeholder="This market will resolve to the winning candidate for Argentina's 2023 Presidential Elections"
              onChange={handleChangeBetOO}
              onBlur={() => handleBlur('marketTerms', betOO)}
            />

            {marketTermsError && (
              <p className='text_error'>This field is required</p>
            )}

            <Form.Label className='text_yellow mt-4' htmlFor="create-bet-oo">Market Image</Form.Label>

            <ImageUploading
              multiple
              value={marketImage}
              onChange={handleOnChangeMarketImage}
              maxNumber='1'
              dataURLKey="data_url"
              acceptType={["jpg", "gif", "png"]}
            >
              {({
                image,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps
              }) => (
                // write your building UI
                <div className="upload__image-wrapper">
                  {!marketImage.length ? (
                    <>
                      <div className="upload_image">
                        <img alt="" width="100" src={upload} style={isDragging ? { color: "red" } : null}
                          {...dragProps}>
                        </img>
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
                          <i className="bi bi-trash" onClick={() => onImageRemove(index)}></i>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </ImageUploading >

            <Form.Label className='text_yellow mt-4' htmlFor="create-bet-choice">
              <div className="d-flex">
                <div>Outcomes</div>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="button-tooltip-2">The initial share distribution determines the final cost of creating your market and the starting probabilities/payoff per outcome.</Tooltip>}
                >
                  <i className="bi bi-info-circle pl-2"></i>
                </OverlayTrigger>
              </div>
            </Form.Label>

            <i className="bi bi-plus-circle-fill mt-2 ml-5" onClick={handleAddBetChoice}></i>
            <div className='d-flex align-middle gap-2'>
              <Form.Control
                type="text"
                id="create-bet-choice"
                placeholder="Write an outcome"
                value={betChoice}
                onChange={handleChangeBetChoice}
                onBlur={() => handleBlur('marketOutcomes', betChoice)}
                onKeyDown={handleOutcomesOnKeyDown}
                ref={outcomeInputRef}
              />
            </div>

            {marketOutcomesError && (
              <p className='text_error'>At least 2 outcomes required</p>
            )}

            {betChoiceList.length > 0 && (
              <>
                <table className="table table-hover mt-2">
                  <thead>
                    <tr>
                      <th className='col-1 text-center'>Image</th>
                      <th className='col-8'>Outcome</th>
                      <th className='col-1 text-center'>%</th>
                      <th className='col-1 text-center'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {betChoiceList.map((item) => (
                      <tr key={item.id} className='align-middle'>
                        <td>

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
                              <div className="upload__image-wrapper table_outcomes">
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

                                  <div className="image-item upload_image">
                                    <img src={item.image[0].data_url} alt="" width="70" />
                                    <div className="overlay">
                                      <i className="bi bi-cloud-arrow-up" onClick={() => onImageUpdate(item.id)} ></i>
                                      <i className="bi bi-trash" onClick={() => handleImageRemove(item.id)}></i>
                                    </div>
                                  </div>

                                )}
                              </div>
                            )}
                          </ImageUploading >

                        </td>
                        <td >{item.betChoice}</td>
                        <td className='text-center'>
                          <Form.Control
                            type="number"
                            className='text_white'
                            style={{ width: '75px' }}
                            value={item.percentage}
                            onChange={(e) => handlePercentageChange(item.id, e.target.value)}
                          />
                        </td>
                        <td className='text-center'>
                          <i className="bi bi-trash3-fill" onClick={() => handleDeleteBetChoice(item.id)}></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {percentageError && (
                  <Alert variant="danger">
                    {percentageError}
                  </Alert>
                )}
              </>
            )}


            <Form.Label className='text_yellow mt-4' htmlFor="create-bet-initial-pool">
              <div className="d-flex">
                <div>Initial pool</div>
              </div>
            </Form.Label>

            <div className='box inputData'>
              <div className='inputStyle'>
                <OverlayTrigger
                  overlay={<Tooltip id="tooltip-decrement">-{minimumInitialPool}</Tooltip>}
                  placement="top"
                >
                  <button className='buttonStyle' disabled={minimumInitialPool >= betInitialPool} onClick={handleDecrementInitialPool}>-</button>
                </OverlayTrigger>
                <input
                  type="text"
                  className="form-control text-center text_gray"
                  disabled={true} 
                  value={minimumInitialPool <= betInitialPool ? betInitialPool : minimumInitialPool}
                  style={{ flex: 1, border: 'none' }}
                  onChange={handleChangeInitialPool}
                />
                <OverlayTrigger
                  overlay={<Tooltip id="tooltip-increment">+{minimumInitialPool}</Tooltip>}
                  placement="top"
                >
                  <button className='buttonStyle' onClick={handleIncrementInitialPool}>+</button>
                </OverlayTrigger>
              </div>
            </div>

            <p className='text_gray'>The market must be bootstrapped with <span className="text_max_c fw-medium">at least {minimumInitialPool} initial shares</span></p>

            <div className='d-flex mt-3'>
              <div className='text_yellow'>Total cost: <span className='total_cost'>{totalCost} USDC</span></div>
            </div>

            <p className='text_gray'>Internal commission 2%</p>

            {/*
            <Form.Label className='fw-bold mt-4' htmlFor="create-bet-commission">
            <div className="d-flex">
              <div>Commission (%)</div>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="button-tooltip-2">Split 50/50 between you and the platform. Taken when winners collect their earnings or on any AMM sells.</Tooltip>}
              >
                <i className="bi bi-info-circle pl-2"></i>
              </OverlayTrigger>
            </div>

          </Form.Label>
          <Form.Control
            type="number"
            id="create-bet-commission"
            placeholder="%"
            value={betCommission}
            onChange={handleChangeCommission}
          />
            */}

            <div>
              <div>
                <Form.Label className='text_yellow mt-4' htmlFor="deadline-date">
                  <div className="d-flex">
                    <div>When will the pool be locked?</div>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="button-tooltip-2">After this date the AMM is disabled so users can only trade between each other without adding/removing liquidity.</Tooltip>}
                    >
                      <i className="bi bi-info-circle pl-2"></i>
                    </OverlayTrigger>
                  </div>
                </Form.Label>
              </div>
              <div>
                <DatePicker
                  className='form-control text_yellow'
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
              </div>

              <div>
                <Form.Label className='text_yellow mt-4' htmlFor="deadline-date">
                  <div className="d-flex">
                    <div>What's the deadline for the market?</div>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="button-tooltip-2">If unresolved after this date, users will be able to reclaim their funds.</Tooltip>}
                    >
                      <i className="bi bi-info-circle pl-2"></i>
                    </OverlayTrigger>
                  </div>
                </Form.Label>
              </div>
              <div>
                <DatePicker
                  className='form-control text_yellow'
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
              <div>
              </div>
            </div>

            {activeContract ? (
              (usdcBalance ? (
                (betChoiceList.length >= 2 ? (
                  (!percentageError ? (
                    <button className='button green standard mt-4' onClick={handleCreateMarket}>Create market</button>
                  ) : (
                    <button className='button alert-danger standard mt-4'>The sum of all % has to be 100</button>
                  ))
                ) : (
                  <button className='button alert-danger standard mt-4'>At least need 2 outcomes</button>
                ))
              ) : (
                (awaitingApproval ? (
                  <button className='button standard mt-4'>Aproving...</button>
                ) : (
                  <button className='button standard mt-4'>Aprove USDC</button>
                ))
              ))
            ) : (
              <button className='button red standard mt-4' onClick={handleConnectWallet}>Connect your wallet</button>
            )}


          </div >
        </div>
      </section >

      <Footer />
    </>
  )
}
