import React from 'react'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import { useStateContext } from '../contexts/ContextProvider';

export const CenterModal = (props) => {

    const { showModalMarket, setShowModalMarket } = useStateContext();
    const { showModalMyMarket, setShowModalMyMarket } = useStateContext();
    const { marketOptionSelected, setMarketOptionSelected } = useStateContext();
    const { myMarketOptionSelected, setMyMarketOptionSelected } = useStateContext();

    const updateData = (event) => {

        const label = event.target.getAttribute('label');
        console.log(props.type)
        if (props.type == 'market'){

            setMarketOptionSelected(label);
            setShowModalMarket(false);
        }
        else {
            setMyMarketOptionSelected(label);
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

                                return <div key={`reverse-${option}`} className={`form-check ${marketOptionSelected == option ? 'active' : ''}`} onClick={updateData} label={option}>
                                    <div className="row" label={option}>
                                        <div className="col-11" label={option}>
                                            <label className="form-check-label" htmlFor={`reverse-${option}`} label={option}>{option}</label>
                                        </div>
                                        <div className="col-1" label={option}>
                                            <input className="form-check-input" type="radio" name="radioOptions" label={option} id={`reverse-${option}`} value={option} checked={marketOptionSelected == option} onChange={e => { }} />
                                        </div>
                                    </div>
                                </div>


                            else
                                return <div key={`reverse-${option}`} className={`form-check ${myMarketOptionSelected == option ? 'active' : ''}`} onClick={updateData} label={option}>
                                    <div className="row" label={option}>
                                        <div className="col-11" label={option}>
                                            <label className="form-check-label" htmlFor={`reverse-${option}`} label={option}>{option}</label>
                                        </div>
                                        <div className="col-1" label={option}>
                                            <input className="form-check-input" type="radio" name="radioOptions" label={option} id={`reverse-${option}`} value={option} checked={myMarketOptionSelected == option} onChange={e => { }} />
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
