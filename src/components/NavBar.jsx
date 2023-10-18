import React from 'react'

import { NavLink } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';

import logo from '../assets/img/logo.png';

export const NavBar = () => {
    return (
        <>
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
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
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

                            <w3m-button />

                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </header>
        </>
    )
}
