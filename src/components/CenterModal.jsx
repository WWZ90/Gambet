import React from 'react'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import { useStateContext } from '../contexts/ContextProvider';

export const CenterModal = (props) => {

    const { showModalMarket, setShowModalMarket } = useStateContext();
    const { showModalMyMarket, setShowModalMyMarket } = useStateContext();
    const { outcomeOptionSelected, setOutcomeOptionSelected } = useStateContext();
    const { myoutcomeOptionSelected, setMyoutcomeOptionSelected } = useStateContext();

    const updateData = (event) => {

        const label = event.target.getAttribute('label');
        if (props.type == 'market'){

            setOutcomeOptionSelected(label);
            setShowModalMarket(false);
        }
        else {
            setMyoutcomeOptionSelected(label);
            setShowModalMyMarket(false);
        }

    }

    const hide = () => {
        setShowModalMarket(false);
        setShowModalMyMarket(false);
    }

    return (
        <>
            <Modal
                {...props}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                onHide={() => hide()}
            >
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Markets
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>

                        {props.options.map((option) => {

                            if (props.type == 'market')

                                return <div key={`reverse-${option}`} className={`form-check ${outcomeOptionSelected == option ? 'active' : ''}`} onClick={updateData} label={option}>
                                    <div className="row" label={option}>
                                        <div className="col-11" label={option}>
                                            <label className="form-check-label" htmlFor={`reverse-${option}`} label={option}>{option}</label>
                                        </div>
                                        <div className="col-1" label={option}>
                                            <input className="form-check-input" type="radio" name="radioOptions" label={option} id={`reverse-${option}`} value={option} checked={outcomeOptionSelected == option} onChange={e => { }} />
                                        </div>
                                    </div>
                                </div>


                            else
                                return <div key={`reverse-${option}`} className={`form-check ${myoutcomeOptionSelected == option ? 'active' : ''}`} onClick={updateData} label={option}>
                                    <div className="row" label={option}>
                                        <div className="col-11" label={option}>
                                            <label className="form-check-label" htmlFor={`reverse-${option}`} label={option}>{option}</label>
                                        </div>
                                        <div className="col-1" label={option}>
                                            <input className="form-check-input" type="radio" name="radioOptions" label={option} id={`reverse-${option}`} value={option} checked={myoutcomeOptionSelected == option} onChange={e => { }} />
                                        </div>
                                    </div>
                                </div>

                        })}

                    </form>

                </Modal.Body>
            </Modal>
        </>
    )
}
