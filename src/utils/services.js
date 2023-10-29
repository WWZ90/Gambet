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

    const formattedDate = date.toLocaleString('en-US', options);

    return formattedDate;
}


export const browseMarkets = async (activeContract) => {

    let markets = null;

    //alert(activeContract);

    markets = (await Promise.all((await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet()))
        .map(e => [e.args[1], e.args[2]])
        .map(async ([id, name]) => [await getMarket(id, activeContract), name])))
        .map(market => {
            const [{ marketId, created, finished, creation, outcomeIndex, deadline, owner, commission, totalShares, shares, outcomes, resolution }, name] = market;
            const mkt = {marketId, created, finished, creation, outcomeIndex, deadline, owner, commission, totalShares, shares, outcomes, resolution, name};
            return mkt;
        });

    //console.log(markets);

    return markets;
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

    const name = (await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet(marketId)))[0].args[2];

    m.name = name;

    //console.log(m);

    return m;
}

export const getOwned = async (market, userAddress, activeContract) => {
    const owned = await Promise.all(market.outcomes.map(outcome => activeContract.userPools(market.marketId, userAddress, outcome)));

    //console.log(owned);

    return owned;
} 

export const getPrices = async (market, owned, userAddress, activeContract) => {
    const avgPrices = await Promise.all(market.outcomes.map((outcome, idx) => activeContract.userTransfers(market.marketId, userAddress, outcome).then(async a => Math.round((Number(a) / 10 ** 6) / Number(owned[idx]) * 1000) / 1000)));

    //console.log(avgPrices);

    return avgPrices;
}

export const calculateCost = (market) => {
    return Math.sqrt(market.shares.reduce((a, b) => a**2 + b**2, 0))
}

export const calculatePrice = (market, outcome) => {
     return market.shares[market.outcomes.indexOf(outcome)] / calculateCost(market)
}
