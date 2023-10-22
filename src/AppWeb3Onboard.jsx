import React, { useEffect } from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { ContextProvider } from "./contexts/ContextProvider";

import { Home } from './pages/Home'
import { BrowseMarkets } from './pages/BrowseMarkets';
import { CreateMarket } from './pages/CreateMarket';
import { WhatWeDo } from './pages/whatwedo';
import { NotFound } from './pages/NotFound';

import Favicon from "./assets/img/favicon.ico";

import blocknativeIcon from './assets/icons/logo.svg'

import {
  init,
  Web3OnboardProvider,
  useConnectWallet,
  useNotifications,
  useSetChain,
  useWallets,
} from '@web3-onboard/react'

import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseModule from '@web3-onboard/coinbase'
import { DetailMarket } from './pages/DetailMarket';

const injected = injectedModule()
const coinbase = coinbaseModule()
const walletConnect = walletConnectModule({
  projectId: 'f6bd6e2911b56f5ac3bc8b2d0e2d7ad5',
  dappUrl: 'https://reactdemo.blocknative.com/'
})

const INFURA_ID = import.meta.env.VITE_INFURA_ID
export const infuraRPC = `https://mainnet.infura.io/v3/${INFURA_ID}`
const dappId = import.meta.env.VITE_BLOCKNATIVE_ID

const web3Onboard = init({
  connect: {
    autoConnectAllPreviousWallet: true
  },
  wallets: [
    injected,
    coinbase,
    walletConnect
  ],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum',
      rpcUrl: infuraRPC
    },
    {
      id: '0x5',
      token: 'ETH',
      label: 'Goerli',
      rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`
    },
    {
      id: '0x13881',
      token: 'MATIC',
      label: 'Polygon - Mumbai',
      rpcUrl: 'https://matic-mumbai.chainstacklabs.com	'
    }
  ],
  appMetadata: {
    name: 'Gambeth',
    icon: blocknativeIcon,
    description: 'A fully decentralized, blockchain-based web application',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' }
    ],
    agreement: {
      version: '1.0.0',
      termsUrl: 'https://www.blocknative.com/terms-conditions',
      privacyUrl: 'https://www.blocknative.com/privacy-policy'
    },
    gettingStartedGuide: 'https://blocknative.com',
    explore: 'https://blocknative.com'
  },
  accountCenter: {
    desktop: {
      position: 'topRight',
      enabled: false,
      minimal: false
    }
  },
  apiKey: dappId,
  notify: {
    transactionHandler: transaction => {

      if (transaction.eventCode === 'txPool') {
        return {
          // autoDismiss set to zero will persist the notification until the user excuses it
          autoDismiss: 0,
          // message: `Your transaction is pending, click <a href="https://goerli.etherscan.io/tx/${transaction.hash}" rel="noopener noreferrer" target="_blank">here</a> for more info.`,
          // or you could use onClick for when someone clicks on the notification itself
          onClick: () =>
            window.open(`https://goerli.etherscan.io/tx/${transaction.hash}`)
        }
      }
    }
  },
  theme: 'dark'
})

function AppWeb3Onboard() {

  useEffect(() => {
    web3Onboard
  }, [])

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Gambeth</title>
          <link rel="icon" type="image/png" href={Favicon} sizes="16x16" />
        </Helmet>
      </HelmetProvider>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <ContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browsemarkets" element={<BrowseMarkets />} />
              <Route path="/market/:id" element={<DetailMarket />} />
              <Route path="/createmarket" element={<CreateMarket />} />
              <Route path="/whatwedo" element={<WhatWeDo />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ContextProvider>
      </Web3OnboardProvider>
    </>
  )
}

export default AppWeb3Onboard
