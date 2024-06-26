import React, { useEffect } from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { ContextProvider } from "./contexts/ContextProvider";

import { Home } from './pages/Home'
import { BrowseMarkets } from './pages/BrowseMarkets';
import { CreateMarket } from './pages/CreateMarket';
import { WhatWeDo } from './pages/whatwedo';
import { NotFound } from './pages/NotFound';

import Favicon from "./assets/img/gambeth-logo.png";

import blocknativeIcon from './assets/img/LogoGambeth_SVG.svg'

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
import magicModule from "@web3-onboard/magic";

import { DetailMarket } from './pages/DetailMarket';
import { Cart } from './pages/Cart';
import { Education } from './pages/Education';
import { CreateMarketCarousel } from './pages/CreateMarketCarousel';

const injected = injectedModule()
const magic = magicModule({
  apiKey: 'pk_live_52CBE113A3A4CDFC',
});
const coinbase = coinbaseModule()
const walletConnect = walletConnectModule({
  projectId: 'f6bd6e2911b56f5ac3bc8b2d0e2d7ad5',
  dappUrl: 'https://reactdemo.blocknative.com/'
})

const INFURA_ID = import.meta.env.VITE_INFURA_ID
export const infuraRPC = `https://mainnet.infura.io/v3/${INFURA_ID}`
const dappId = import.meta.env.VITE_BLOCKNATIVE_ID

const customTheme = {
  '--w3o-background-color': '#6F75E5',
  '--w3o-foreground-color': '#02024C',
  '--w3o-text-color': '#F3F9D2',
  '--w3o-border-color': '#ccc',
  '--w3o-action-color': '#F3F9D2',
  '--w3o-border-radius': '15px'
}

const web3Onboard = init({
  connect: {
    autoConnectAllPreviousWallet: true
  },
  wallets: [
    injected,
      magic,
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
      id: '0x13881',
      token: 'MATIC',
      label: 'Polygon - Mumbai',
      rpcUrl: 'https://public.stackup.sh/api/v1/node/polygon-mumbai'
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
      return {
        // autoDismiss set to zero will persist the notification until the user excuses it
        autoDismiss: transaction.eventCode === "txConfirmed" ? 5000 : 0,
        message: localStorage[transaction.eventCode],
        // or you could use onClick for when someone clicks on the notification itself
        onClick: () =>
            window.open(`https://goerli.etherscan.io/tx/${transaction.hash}`)
      }
    }
  },
  theme: customTheme
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
              <Route path="/market/id/:id" element={<DetailMarket />} />
              <Route path="/createmarket2" element={<CreateMarket />} />
              <Route path="/createmarket" element={<CreateMarketCarousel />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/whatwedo" element={<WhatWeDo />} />
              <Route path="/education" element={<Education />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ContextProvider>
      </Web3OnboardProvider>
    </>
  )
}

export default AppWeb3Onboard
