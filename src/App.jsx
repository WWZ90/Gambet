import reactLogo from './assets/react.svg'
import './App.css'

import './assets/fonts/Saira/Saira-Regular.ttf';
import './assets/fonts/Saira/Saira-Black.ttf';
import './assets/fonts/Saira/Saira-BlackItalic.ttf';
import './assets/fonts/Saira/Saira-Bold.ttf';
import './assets/fonts/Saira/Saira-BoldItalic.ttf';
import './assets/fonts/Saira/Saira-ExtraBold.ttf';
import './assets/fonts/Saira/Saira-ExtraBoldItalic.ttf';
import './assets/fonts/Saira/Saira-ExtraLight.ttf';
import './assets/fonts/Saira/Saira-ExtraLightItalic.ttf';
import './assets/fonts/Saira/Saira-Italic.ttf';
import './assets/fonts/Saira/Saira-Light.ttf';
import './assets/fonts/Saira/Saira-Medium.ttf';
import './assets/fonts/Saira/Saira-MediumItalic.ttf';
import './assets/fonts/Saira/Saira-SemiBold.ttf';
import './assets/fonts/Saira/Saira-SemiBoldItalic.ttf';
import './assets/fonts/Saira/Saira-Thin.ttf';
import './assets/fonts/Saira/Saira-ThinItalic.ttf';



import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Helmet, HelmetProvider } from "react-helmet-async";

import { Home } from './pages/Home'

import Favicon from "./assets/img/favicon.ico";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, goerli } from 'wagmi/chains'
import { BrowseMarkets } from './pages/BrowseMarkets';
import { CreateMarket } from './pages/CreateMarket';
import { Cart } from './pages/Cart';
import { WhatWeDo } from './pages/WhatWeDo';
import { NotFound } from './pages/NotFound';

// 1. Get projectId
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [goerli]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({
  wagmiConfig, projectId, chains, themeVariables: {
    "--w3m-font-family": "GothamPro Light, sans-serif",
    "--w3m-background-color": "#555555",
    "--w3m-accent-color": "#555555",
    "--w3m-text-big-bold-weight": "light",
    "--w3m-text-medium-regular-weight": "normal",
  }
})




function App() {

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Gambeth</title>
          <link rel="icon" type="image/png" href={Favicon} sizes="16x16" />
        </Helmet>
      </HelmetProvider>
      <WagmiConfig config={wagmiConfig}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browsemarkets" element={<BrowseMarkets />} />
            <Route path="/createmarket" element={<CreateMarket />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/whatwedo" element={<WhatWeDo />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WagmiConfig>
    </>
  )
}

export default App
