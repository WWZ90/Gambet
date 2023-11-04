import React, { useState, useRef } from 'react'

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { NavBarWeb3Onboard } from '../components/NavBarWeb3Onboard'
import { Footer } from '../components/Footer'

export const CreateMarket = () => {

  const outcomeInputRef = useRef(null);

  const [betID, setBetID] = useState()
  const [betSchema, setBetSchema] = useState()
  const [betOOTitle, setBetOOTitle] = useState()
  const [betOO, setBetOO] = useState()
  const [betChoice, setBetChoice] = useState()
  const [betChoiceList, setBetChoiceList] = useState([])
  const [idBetChoice, setIdBetChoice] = useState(0)
  const [betInitialPool, setBetInitialPool] = useState(0);
  const [betCommission, setBetCommission] = useState(0);

  const [deadlineDate, setDeadlineDate] = useState(new Date());
  const [scheduleDate, setScheduleDate] = useState(new Date());

  const [percentageError, setPercentageError] = useState('');

  const handleChangeBetID = (event) => {
    setBetID(event.target.value)
  }

  const handleChangeBetSchema = (event) => {
    setBetSchema(event.target.value)
  }

  const handleChangeBetOOTitle = (event) => {
    setBetOOTitle(event.target.value)
  }

  const handleChangeBetOO = (event) => {
    setBetOO(event.target.value)
  }

  const handleChangeBetChoice = (event) => {
    setBetChoice(event.target.value);
  }

  const handleOnKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddBetChoice();
    }
  }


  const handleAddBetChoice = () => {
    if (betChoice.trim() !== '') {
      setBetChoiceList([...betChoiceList, { id: idBetChoice, betChoice, percentage: 0 }]);
      setIdBetChoice(idBetChoice + 1);
      setBetChoice('');
      outcomeInputRef.current.focus();
    }
  }

  const handleDeleteBetChoice = (id) => {

    const newBetChoiceList = betChoiceList.filter((item) => item.id !== id);

    setBetChoiceList(newBetChoiceList);

    checkPercentageSum(newBetChoiceList);
  }

  const handlePercentageChange = (id, percentage) => {
    const newBetChoiceList = betChoiceList.map((item) => {
      if (item.id === id) {
        return { ...item, percentage };
      }
      return item;
    });

    setBetChoiceList(newBetChoiceList);
    checkPercentageSum(newBetChoiceList);
  }

  const checkPercentageSum = (newBetChoiceList) => {

    if (allPercentagesZero(newBetChoiceList)) { //Esto verifica si todos los outcomes estan con 0%, entonces no muestra error (o si deberia porque es obligatorio?)
      setPercentageError('');
      return;
    }

    const sum = newBetChoiceList.reduce((total, item) => total + parseFloat(item.percentage), 0);

    if (newBetChoiceList.length > 0) {
      if (sum !== 100) {
        setPercentageError('The sum of all the % has to be 100');
      } else {
        setPercentageError('');
      }
    }
  }

  const allPercentagesZero = (list) => {
    return list.every((item) => parseFloat(item.percentage) === 0);
  }

  const handleChangeInitialPool = (event) => {
    setBetInitialPool(event.target.value);
  }

  const handleChangeCommission = (event) => {
    setBetCommission(event.target.value);
  }

  const handleDeadLineDateChange = (date) => {
    setDeadlineDate(date);
    if (scheduleDate < date) {
      setScheduleDate(date);
    }
  }

  const handleScheduleDateChange = (date) => {
    setScheduleDate(date);
  }

  const handleCreateMarket = () => {
    //TODO
  }
  
  return (
    <>
      <NavBarWeb3Onboard />

      <section className='create_market' id='create_market' >
        <div className="container">

          <h1>Create a market</h1>

          <Form.Label className='fw-bold' htmlFor="create-bet-id">Market ID</Form.Label>
          <Form.Control
            type="text"
            id="create-bet-id"
            value={betID}
            placeholder="argentina-2023"
            aria-describedby="create-bet-id-HelpBlock"
            onChange={handleChangeBetID}
          />
          <Form.Text id="create-bet-id-HelpBlock" muted>
            Your market's ID is a unique identifier which allows other users to search for it. https://gambeth.com/?id={betID}
          </Form.Text>

          <div className='fw-bold mt-4'>How should the contract determine the outcome of your bet?</div>
          <Form.Select aria-label="Default select example" name='create-bet-schema' id='create-bet-schema' onChange={handleChangeBetSchema}>
            <option value="oo">Optimistic oracle decision</option>
            <option value="bc">Bet creator's decision</option>
            <option value="wa">OoAlpha oracle query</option>
            <option value="xml">XML oracle query</option>
            <option value="json">JSON oracle query</option>
            <option value="html">Process HTML data</option>
          </Form.Select>

          <Form.Label className='fw-bold mt-4' htmlFor="create-bet-oo-title">Market Name</Form.Label>
          <Form.Control
            type="text"
            id="create-bet-oo-title"
            value={betOOTitle}
            placeholder="For example: Argentina's Presidential Elections"
            onChange={handleChangeBetOOTitle}
          />

          <Form.Label className='fw-bold mt-4' htmlFor="create-bet-oo">Market Terms</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            id="create-bet-oo"
            value={betOO}
            placeholder="This market will resolve to the winning candidate for Argentina's 2023 Presidential Elections"
            onChange={handleChangeBetOO}
          />

          <Form.Label className='fw-bold mt-4' htmlFor="create-bet-choice">Outcomes</Form.Label>

          <div className='d-flex'>
            <Form.Control
              type="text"
              id="create-bet-choice"
              placeholder="Write an outcome"
              value={betChoice}
              onChange={handleChangeBetChoice}
              onKeyDown={handleOnKeyDown}
              ref={outcomeInputRef}
            />

            <i className="bi bi-plus-circle-fill" onClick={handleAddBetChoice}></i>
          </div>

          <Form.Text id="create-bet-id-HelpBlock" muted>
            The initial share distribution determines the final cost of creating your market and the starting probabilities/payoff per outcome.
          </Form.Text>
          <table className="table table-hover mt-2">
            <thead>
              <tr>
                <th className='col-10'>Outcome</th>
                <th className='col-1 text-center'>%</th>
                <th className='col-1 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {betChoiceList.map((item) => (
                <tr key={item.id}>
                  <td >{item.betChoice}</td>
                  <td className='text-center'>
                    <Form.Control
                      type="number"
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

          <Form.Label className='fw-bold mt-4' htmlFor="create-bet-initial-pool">Initial pool</Form.Label>
          <Form.Control
            type="number"
            id="create-bet-initial-pool"
            placeholder="# Shares"
            value={betInitialPool}
            onChange={handleChangeInitialPool}
          />
          <Form.Text id="create-bet-id-HelpBlock" muted>
            The market must be bootstrapped with at least 0 initial shares
          </Form.Text>

          <div className='d-flex mt-3'>
            <div className='fw-bold'>Total cost: $10 USDC</div>
          </div>

          <Form.Label className='fw-bold mt-4' htmlFor="create-bet-commission">Commission (%)</Form.Label>
          <Form.Control
            type="number"
            id="create-bet-commission"
            placeholder="%"
            value={betCommission}
            onChange={handleChangeCommission}
          />
          <Form.Text id="create-bet-id-HelpBlock" muted>
            Split 50/50 between you and the platform. Taken when winners collect their earnings or on any AMM sells.
          </Form.Text>

          <div>
            <div>
              <Form.Label className='fw-bold mt-4' htmlFor="deadline-date">When will the pool be locked?</Form.Label>
            </div>
            <div>
              <DatePicker
                selected={deadlineDate}
                id="deadline-date"
                onChange={handleDeadLineDateChange}
                timeInputLabel="Time:"
                dateFormat="MM/dd/yyyy h:mm aa"
                showTimeInput
                minDate={new Date()}
                minTime={new Date(deadlineDate)}
              />
            </div>
            <div>
              <Form.Text id="deadline-date" muted>
                After this date the AMM is disabled so users can only trade between each other without adding/removing liquidity.
              </Form.Text>
            </div>

            <div>
              <Form.Label className='fw-bold mt-4' htmlFor="deadline-date">What's the deadline for the market? </Form.Label>
            </div>
            <div>
              <DatePicker
                selected={scheduleDate}
                id="schedule-date"
                onChange={handleScheduleDateChange}
                timeInputLabel="Time:"
                dateFormat="MM/dd/yyyy h:mm aa"
                showTimeInput
                minDate={deadlineDate}
                minTime={new Date(deadlineDate).getTime()}
              />
            </div>
            <div>
              <Form.Text id="schedule-date" muted>
                If unresolved after this date, users will be able to reclaim their funds.
              </Form.Text>
            </div>
          </div>

          <button className='button mt-4' onClick={handleCreateMarket}>Create market</button>
        </div >
      </section>

      <Footer />
    </>
  )
}
