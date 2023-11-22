import React, { useEffect } from 'react'

import UMA from '../assets/img/uma.png';
import Logo from '../assets/img/gambeth-logo-text.png';

export const Footer = () => {

    useEffect(() => {

        /**
    * Preloader
    */
        const preloader = document.querySelector('#preloader');
        if (preloader) {
            window.addEventListener('load', () => {
                preloader.remove();
            });
        }

        /**
     * Easy selector helper function
     */
        const select = (el, all = false) => {
            el = el.trim()
            if (all) {
                return [...document.querySelectorAll(el)]
            } else {
                return document.querySelector(el)
            }
        }


        /**
         * Easy event listener function
         */
        const on = (type, el, listener, all = false) => {
            let selectEl = select(el, all)
            if (selectEl) {
                if (all) {
                    selectEl.forEach(e => e.addEventListener(type, listener))
                } else {
                    selectEl.addEventListener(type, listener)
                }
            }
        }

        /**
         * Easy on scroll event listener 
         */
        const onscroll = (el, listener) => {
            el.addEventListener('scroll', listener)
        }

        /**
       * Apply .scrolled class to the body as the page is scrolled down
       */
        const selectBody = document.querySelector('body');
        const selectHeader = document.querySelector('#header');

        function toggleScrolled() {
            if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
            window.scrollY > 50 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
        }

        document.addEventListener('scroll', toggleScrolled);
        window.addEventListener('load', toggleScrolled);

        /**
         * Scroll up sticky header to headers with .scroll-up-sticky class
         */
        let lastScrollTop = 0;
        window.addEventListener('scroll', function () {
            if (!selectHeader.classList.contains('scroll-up-sticky')) return;

            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop && scrollTop > selectHeader.offsetHeight) {
                selectHeader.style.setProperty('position', 'sticky', 'important');
                selectHeader.style.top = `-${header.offsetHeight + 50}px`;
            } else if (scrollTop > selectHeader.offsetHeight) {
                selectHeader.style.setProperty('position', 'sticky', 'important');
                selectHeader.style.top = "0";
            } else {
                selectHeader.style.removeProperty('top');
                selectHeader.style.removeProperty('position');
            }
            lastScrollTop = scrollTop;
        });



        /**
         * Back to top button
         */
        let backtotop = select('.back-to-top')
        if (backtotop) {
            const toggleBacktotop = () => {
                if (window.scrollY > 200) {
                    backtotop.classList.add('active')
                } else {
                    backtotop.classList.remove('active')
                }
            }
            window.addEventListener('load', toggleBacktotop)
            onscroll(document, toggleBacktotop)
        }

    }, [])

    return (
        <>
            <footer id="footer" className="footer">

                <div className="footer-content position-relative">
                    <div className="container">
                        <div className="row">

                            <div className="col-lg-4 col-md-6">
                                <div className="footer-info">
                                    <img src={Logo} className='footer_logo'></img>
                                    <p>
                                        A108 Adam Street <br></br>
                                        NY 535022, USA<br></br>
                                        <strong>Phone:</strong> +1 5589 55488 55<br></br>
                                        <strong>Email:</strong> contact@gambeth.com<br></br>
                                    </p>
                                    <div className="social-links d-flex mt-3">
                                        <a href="#" className="d-flex align-items-center justify-content-center"><i className="bi bi-twitter"></i></a>
                                        <a href="#" className="d-flex align-items-center justify-content-center"><i className="bi bi-facebook"></i></a>
                                        <a href="#" className="d-flex align-items-center justify-content-center"><i className="bi bi-instagram"></i></a>
                                        <a href="#" className="d-flex align-items-center justify-content-center"><i className="bi bi-linkedin"></i></a>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-2 col-md-3 footer-links">
                                <h4>Our Services</h4>
                                <ul>
                                    <li><a href="#">Home</a></li>
                                    <li><a href="#">Browse markets</a></li>
                                    <li><a href="#">Create market</a></li>
                                    <li><a href="#">What we do?</a></li>
                                    <li><a href="#">Privacy policy</a></li>
                                </ul>
                            </div>

                            <div className="col-lg-2 col-md-3 footer-links">
                                <h4>Useful Links</h4>
                                <ul>
                                    <li><a href="#">Web Design</a></li>
                                    <li><a href="#">Web Development</a></li>
                                    <li><a href="#">Product Management</a></li>
                                    <li><a href="#">Marketing</a></li>
                                    <li><a href="#">Graphic Design</a></li>
                                </ul>
                            </div>

                            <div className="col-lg-4 col-md-4 footer-links text-end justify-content-end">
                                <a href='https://uma.xyz/' target='_blank'>
                                    <img src={UMA}></img>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="footer-legal text-center position-relative">
                    <div className="container">
                        <div className="copyright">
                            &copy; Copyright <strong><span>Gambeth</span></strong> 2023. All Rights Reserved
                        </div>
                        <div className="credits">
                            Designed by <a href="https://gambeth.com/">Gambeth</a>
                        </div>
                    </div>
                </div>

            </footer>
        </>
    )
}
