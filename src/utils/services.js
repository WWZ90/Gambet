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

    let ma = null;

    //alert(activeContract);

    ma = (await Promise.all((await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet()))
    .map(e => [e.args[1], e.args[2]])
    .map(async ([id, name]) => [await getMarket(id, activeContract), name])))
    .map(([{marketId, totalShares}, name]) => ({marketId, totalShares, name}));

    console.log(ma);

    return ma;
}

const marketCache = {};

export const getMarket = async (marketId, activeContract) => {
    return marketCache[marketId] || await activeContract.markets(marketId).then(([marketId, created, finished, creation, outcomeIndex, kind, lockout, deadline, owner, commission, totalShares, commissionDenominator]) => marketCache[marketId] = {
        marketId,
        created,
        finished,
        creation: Number(creation),
        outcomeIndex,
        kind,
        lockout: Number(lockout),
        deadline: Number(deadline),
        owner,
        commission: Number(commission),
        totalShares: Number(totalShares),
        commissionDenominator: Number(commissionDenominator),
    });
}
