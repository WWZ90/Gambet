export function formatAddress(address) {
    return address.substring(2, 6) + "..." + address.substring(38, 42);
}

export function formatBalance(balance) {
    return balance[0].substring(0, 7);
}

export function truncateText(str) {
    return str.length > 35 ? str.substring(0, 35) + "..." : str;
}

export const browseMarkets = async (activeContract) => {

    let markets = null;

    //alert(activeContract);

    markets = (await Promise.all((await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet()))
    .map(e => [e.args[1], e.args[2]])
    .map(async ([id, name]) => [await getMarket(id, activeContract), name])))
    .map(([{marketId, created, finished, creation, outcomeIndex, deadline, owner, commission,  totalShares, shares, outcomes, resolution}, name]) => ({marketId, created, finished, creation, outcomeIndex, deadline, owner, commission,  totalShares, shares, outcomes, resolution, name}));

    console.log(markets);

    return markets;
}

const marketCache = {};

export const getMarket = async (marketId, activeContract) => {
    const m = marketCache[marketId] || await activeContract.markets(marketId).then(([marketId, created, finished, creation, outcomeIndex, kind, resolution, deadline, owner, totalShares, outcomes, shares]) => marketCache[marketId] = {
        marketId,
        created,
        finished,
        creation: Number(creation),
        outcomeIndex,
        kind,
        resolution: Number(resolution),
        deadline: Number(deadline),
        owner,
        commission: 5,
        totalShares: Number(totalShares),
        outcomes: outcomes.split(" || "),
        shares: shares.split(" || ").map(n => Number(n)),
        commissionDenominator: 100,
    });

    const name = (await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet(marketId)))[0].args[2];

    m.name = name;

    //console.log(m);

    return m;
}
