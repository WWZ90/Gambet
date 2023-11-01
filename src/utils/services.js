export function formatAddress(address) {
    return address.substring(2, 6) + "..." + address.substring(38, 42);
}

export function formatBalance(balance) {
    return balance[0].substring(0, 7);
}

export function truncateText(str) {
    return str.length > 35 ? str.substring(0, 35) + "..." : str;
}

export function formatDate(d) {
    const dateString = new Date(d * 1000);

    const date = new Date(dateString);

    const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };

    return date.toLocaleString('en-US', options);
}

export function formatDateShort(d) {
    const dateString = new Date(d * 1000);

    const date = new Date(dateString);

    const options = { year: 'numeric', month: 'short', day: '2-digit' };

    return date.toLocaleString('en-US', options);
}



export const browseMarkets = async (activeContract) => {
    return (await Promise.all((await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet()))
        .map(e => [e.args[1], e.args[2]])
        .map(async ([id, name]) => [await getMarket(id, activeContract), name])))
        .map(market => {
            const [{ marketId, created, finished, creation, outcomeIndex, deadline, owner, commission, totalShares, shares, outcomes, resolution }, name] = market;
            const mkt = {marketId, created, finished, creation, outcomeIndex, deadline, owner, commission, totalShares, shares, outcomes, resolution, name};
            mkt.prices = mkt.outcomes.map(o => calculatePrice(mkt, o));
            return mkt;
        });
}

const marketCache = {};

export const getMarket = async (marketId, activeContract) => {

    const m = marketCache[marketId] || await activeContract.markets(marketId).then(market => {
        const [marketId, created, finished, creation, outcomeIndex, kind, lockout, deadline, owner, totalShares, outcomes, shares] = market;
        return marketCache[marketId] = {
            marketId,
            created,
            finished,
            creation: formatDate(Number(creation)),
            outcomeIndex,
            kind,
            resolution: formatDate(Number(lockout)),
            deadline: formatDate(Number(deadline)),
            owner,
            commission: 5,
            totalShares: Number(totalShares),
            outcomes: outcomes.split(" || "),
            shares: shares.split(" || ").map(n => Number(n)),
            commissionDenominator: 100,
        }
    });

    m.name = (await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet(marketId)))[0].args[2];

    return m;
}

export const getOwned = async (market, userAddress, activeContract) => {
    return await Promise.all(market.outcomes.map(outcome => activeContract.userPools(market.marketId, userAddress, outcome)));
} 

export const getPrices = async (market, owned, userAddress, activeContract) => {
    return await Promise.all(market.outcomes.map((outcome, idx) => activeContract.userTransfers(market.marketId, userAddress, outcome).then(async a => Math.round((Number(a) / 10 ** 6) / Number(owned[idx]) * 1000) / 1000)));
}

export const calculateCost = (market) => {
    return Math.sqrt(market.shares.map(a => a ** 2).reduce((a, b) => a + b, 0))
}

export const calculatePrice = (market, outcome) => {
     return market.shares[market.outcomes.indexOf(outcome)] / calculateCost(market)
}

export const fetchOrders = async (refresh, activeContract, activeMarketId) => {
    let betOrders = refresh ? [] : (betOrders || []);
    const contractOrders = await (activeContract || {getOrders: async () => []}).getOrders(activeMarketId || "", betOrders.length, 100);
    const newOrders = contractOrders.map(o => ({
        orderPosition: o[0] ? "SELL" : "BUY",
        pricePerShare: Number(o[1]) / 1e6,
        outcome: o[2],
        amount: Number(o[3]),
        user: o[4],
        idx: o[5]
    }));
    betOrders = betOrders.concat(newOrders);
    betOrders.sort((a, b) => a.orderPosition < b.orderPosition ? 1 : (Number(a.pricePerShare) - Number(b.pricePerShare)));
    return betOrders;
}