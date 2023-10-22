import { createContext, useContext, useState } from "react";

const StateContext = createContext({})

export const ContextProvider = ({ children }) => {

    const [account, setAccount] = useState(null);
    const [wrongChain, setWrongChain] = useState(false);
    
    const [test, setTest] = useState(null);

    const [provider, setProvider] = useState(null);
    const [providerLoaded, setProviderLoaded] = useState(false);
    const [signer, setSigner] = useState(null);
    const [activeContract, setActiveContract] = useState(null);
    const [owner, setOwner] = useState(null);
    const [marketId, setMarketId] = useState(null);
    const [activeMarketId, setActiveMarketId] = useState(null);
    const [activeMarket, setActiveMarket] = useState({});
    const [placedBets, setPlacedBets] = useState([]);
    const [newmarketId, setNewmarketId] = useState(null);
    const [betType, setBetType] = useState("oo");
    
    const [marketsArray, setMarketsArray] = useState(null);
    const [outcomeOptionSelected, setOutcomeOptionSelected] = useState(null);
    const [showModalMarket, setShowModalMarket] = useState(null);  
    const [showModalMyMarket, setShowModalMyMarket] = useState(null); 
    
    const [dataAsks, setDataAsks] = useState([]); //Datos de Shares
    const [dataBids, setDataBids] = useState([]); //Datos de Shares

    const [dataAsksPrice, setDataAsksPrice] = useState([]); //Datos de Precio
    const [dataBidsPrice, setDataBidsPrice] = useState([]); //Datos de Precio

    const [outcomeData, setOutcomeData] = useState([]); //Arreglo de datos que se muestra en la tabla en DetailMarket
    const [myOutcomeByMarket, setMyOutcomeByMarket] = useState([]); //Arreglo de datos para los outcomes que tienes en un market en especifico

    //BOX de buy y sell
    const [activeOption, setActiveOption] = useState('buy'); //Para controlar si esta en Buy o en Sell
    const [limitPrice, setLimitPrice] = useState(0); 
    const [shares, setShares] = useState(0); 
    const [amount, setAmount] = useState(0); 

    return (
        <StateContext.Provider value={
            {
                account, setAccount,
                wrongChain, setWrongChain,
                provider, setProvider,
                providerLoaded, setProviderLoaded,
                signer, setSigner,
                activeContract, setActiveContract,
                owner, setOwner,
                marketId, setMarketId,
                activeMarketId, setActiveMarketId,
                activeMarket, setActiveMarket,
                placedBets, setPlacedBets,
                newmarketId, setNewmarketId,
                betType, setBetType,
                marketsArray, setMarketsArray,
                outcomeOptionSelected, setOutcomeOptionSelected,
                showModalMarket, setShowModalMarket,
                showModalMyMarket, setShowModalMyMarket,
                dataAsks, setDataAsks,
                dataAsksPrice, setDataAsksPrice,
                dataBids, setDataBids,
                dataBidsPrice, setDataBidsPrice,
                activeOption, setActiveOption,
                limitPrice, setLimitPrice,
                shares, setShares,
                amount, setAmount,
                outcomeData, setOutcomeData,
                myOutcomeByMarket, setMyOutcomeByMarket,
            }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);