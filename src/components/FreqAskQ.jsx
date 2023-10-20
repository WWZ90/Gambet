import React from 'react'

export const FreqAskQ = () => {
    return (
        <>
            <section id="faq" className="faq section-bg">
                <div className="container" data-aos="fade-up">

                    <div className="section-title">
                        <h2>Frequently Asked Questions</h2>
                        <p>Learn more about Gambeth and everything it can offer you.</p>
                    </div>

                    <div className="faq-list">
                        <ul>
                            <li data-aos="fade-up">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" className="collapse" data-bs-target="#faq-list-1">What is this? <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-1" className="collapse show" data-bs-parent=".faq-list">
                                    <p>
                                        A fully decentralized, blockchain-based web application in which anyone can participate on or create their own parimutuel betting pools.
                                    </p>
                                </div>
                            </li>

                            <li data-aos="fade-up" data-aos-delay="100">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" data-bs-target="#faq-list-2" className="collapsed">Show me an example <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-2" className="collapse" data-bs-parent=".faq-list">
                                    <p>
                                        Who will be elected Argentina's 2024 president?
                                    </p>
                                </div>
                            </li>

                            <li data-aos="fade-up" data-aos-delay="200">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" data-bs-target="#faq-list-3" className="collapsed">How do I sign up? <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-3" className="collapse" data-bs-parent=".faq-list">
                                    <p>
                                        You can't! User interaction is entirely blockchain based, so using Gambeth is as simple as having MetaMask installed and some funds in your account.
                                    </p>
                                </div>
                            </li>

                            <li data-aos="fade-up" data-aos-delay="300">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" data-bs-target="#faq-list-4" className="collapsed">Who determines the outcome of a bet? <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-4" className="collapse" data-bs-parent=".faq-list">
                                    <p>
                                        Gambeth uses UMA's decentralized oracle service under the hood to determine the resolution for each market. This oracle has been battle-tested in several dApps, Polymarket being the most well known one.
                                    </p>
                                </div>
                            </li>

                            <li data-aos="fade-up" data-aos-delay="400">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" data-bs-target="#faq-list-5" className="collapsed">How do I place a bet? <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-5" className="collapse" data-bs-parent=".faq-list">
                                    <div>
                                        <p>Search for the ID of the bet you want to participate in and check the market's info to make sure everything looks good.</p>
                                        <p>Choose your predicted outcome, how many shares you'd like to buy and the price per share you're willing to pay, then click the "Add" button to add your pending order.</p>
                                        <p>Once all your placed orders are ready, click the "Place orders" button and approve the transaction!</p>
                                    </div>
                                </div>
                            </li>

                            <li data-aos="fade-up" data-aos-delay="300">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" data-bs-target="#faq-list-6" className="collapsed">AMM/Limit orders <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-6" className="collapse" data-bs-parent=".faq-list">
                                    <p>
                                        Automated Market Maker (AMM) orders allow anyone to purchase or sell shares for a particular outcome, even if no opposite order from another user can be found at the time. This type of orders affect the market's circulating number of shares, thus affecting the odds and market price of all shares. Limit orders, on the other hand, are always executed between two users and do not change the number of circulating shares. Because of this, limit orders have no impact on the current market price/odds.
                                    </p>
                                </div>
                            </li>

                            <li data-aos="fade-up" data-aos-delay="300">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" data-bs-target="#faq-list-7" className="collapsed">What happens if I win? <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-7" className="collapse" data-bs-parent=".faq-list">
                                    <p>
                                        First of all, congratulations! After the bet has been executed and the outcome uploaded to the blockchain, all you need to do is lookup the bet's ID in Gambeth and click on the "Claim Bet" button. Your earnings will be dependent on two factors: your share of the winner's pool, and the bet's commission costs.
                                    </p>
                                </div>
                            </li>

                            <li data-aos="fade-up" data-aos-delay="300">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" data-bs-target="#faq-list-8" className="collapsed">What happens if no one wins or if the bet fails to resolve? <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-8" className="collapse" data-bs-parent=".faq-list">
                                    <p>
                                        In both cases you can simply reclaim your funds.
                                    </p>
                                </div>
                            </li>

                            <li data-aos="fade-up" data-aos-delay="300">
                                <i className="bi bi-info-circle icon-help"></i> <a data-bs-toggle="collapse" data-bs-target="#faq-list-9" className="collapsed">How do I create a bet? <i className="bi bi-chevron-down icon-show"></i><i className="bi bi-chevron-up icon-close"></i></a>
                                <div id="faq-list-9" className="collapse" data-bs-parent=".faq-list">
                                    <p>
                                        Click the "Create Market" button and you'll be presented with all the information you need to complete when creating a market. If you'd like to get people interested in your market, a great way to do so is setting up an initial pool!
                                    </p>
                                </div>
                            </li>

                        </ul>
                    </div>

                </div>
            </section>
        </>
    )
}
