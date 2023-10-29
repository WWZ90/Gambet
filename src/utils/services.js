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
            console.log(market);
            const [{ marketId, created, finished, creation, outcomeIndex, deadline, owner, commission, totalShares, shares, outcomes, resolution }, name] = market;
            const mkt = {marketId, created, finished, creation, outcomeIndex, deadline, owner, commission, totalShares, shares, outcomes, resolution, name};
            console.log(mkt);
            return mkt;
        });

    console.log(markets);

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

    console.log(m);

    const name = (await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet(marketId)))[0].args[2];

    m.name = name;

    //console.log(m);

    return m;
}


