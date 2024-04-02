export function formatAddress(address) {
    return address.substring(2, 6) + "..." + address.substring(38, 42);
}

export function formatBalance(balance) {
    return balance[0].substring(0, 7);
}

export function truncateText(str) {
    return str.length > 35 ? str.substring(0, 35) + "..." : str;
}

export function truncateTextSize(str, size) {
    return str.length > size ? str.substring(0, size) + "..." : str;
}

export const numberToToken = async (n, activeContract, activeMarketId) => {
    if (!activeMarketId) return BigInt(n) * BigInt(1e6);
    let d = await activeContract.tokenDecimals(await activeContract.betTokens(activeMarketId));
    return BigInt(n) * BigInt(d);
}

export const tokenToNumber = async (n, activeContract, activeMarketId) => {
    if (!activeMarketId) return (Number(n) / 1e6).toFixed(3);
    let d = await activeContract.tokenDecimals(await activeContract.betTokens(activeMarketId));
    return (Number(n) / Number(d)).toFixed(3);
}

export function formatDate(d) {
    const dateString = new Date(d * 1000);

    const date = new Date(dateString);

    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };

    return date.toLocaleString('en-US', options);
}

export function formatDateShort(d) {
    const dateString = new Date(d * 1000);

    const date = new Date(dateString);

    const options = {year: 'numeric', month: 'short', day: '2-digit'};

    return date.toLocaleString('en-US', options);
}


export const browseMarkets = async (activeContract) => {
    //console.log(activeContract.filters);
    const filter = activeContract.filters.CreatedOptimisticBet();
    const markets = (await Promise.all((await activeContract.queryFilter(filter, 47239866, 'latest'))
        .map(e => [e.args[1], e.args[2], e.args[3]])
        .map(async ([id, name, terms]) => [await getMarket(id, activeContract), name, terms])))
        .map(market => {
            const [{
                marketId,
                created,
                finished,
                creation,
                outcomeIndex,
                deadline,
                owner,
                commission,
                totalShares,
                shares,
                outcomes,
                resolution,
                marketImage,
                outcomeImages
            }, name, terms] = market;
            const mkt = {
                marketId,
                created,
                finished,
                creation,
                outcomeIndex,
                deadline,
                owner,
                commission,
                totalShares,
                shares,
                outcomes,
                resolution,
                name,
                marketImage,
                outcomeImages,
                terms
            };
            mkt.prices = mkt.outcomes.map(o => calculatePrice(mkt, o));
            return mkt;
        });
    //console.log(markets);
    return markets;
}

const marketCache = {};

export const getMarket = async (marketId, activeContract) => {
    //console.log('getMarket');

    const m = await activeContract.markets(marketId).then(market => {
        let [marketId, created, finished, creation, outcomeIndex, kind, lockout, deadline, owner, totalShares, outcomes, shares, resolution, marketImage, outcomeImages] = market;

        shares = shares.split(" || ").map(n => Number(n));

        outcomeImages = outcomeImages.split(" || ");
        outcomeImages = outcomeImages.slice(0, outcomeImages.length - 1);

        outcomes = outcomes.split(" || ");

        //console.log("SHARES | OUTCOMES | IMAGE | IMAGES", shares, outcomes, marketImage, outcomeImages);

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
            outcomes,
            shares,
            commissionDenominator: 100,
            marketImage,
            outcomeImages
        }
    });

    let filter = activeContract.filters.CreatedOptimisticBet(marketId);
    //console.log(filter);
    m.name = (await activeContract.queryFilter(filter))[0].args[2];
    m.terms = (await activeContract.queryFilter(activeContract.filters.CreatedOptimisticBet(marketId)))[0].args[3];

    //console.log(m);

    return m;
}

export const verifyMarketExist = async (marketId, activeContract) => {
    //console.log('MarketExist');

    const m = await activeContract.markets(marketId);

    //console.log(m[1]);

    return m[1];
}

export const getOwned = async (market, userAddress, activeContract) => {
    //console.log("Getting owned for", userAddress);
    const owned = await Promise.all(market.outcomes.map(outcome => activeContract.userPools(market.marketId, userAddress, outcome)));
    //console.log(owned);
    return owned
}

export const getPrices = async (market, owned, userAddress, activeContract) => {
    return await Promise.all(market.outcomes.map((outcome, idx) => activeContract.userTransfers(market.marketId, userAddress, outcome).then(async a => Math.round((Number(a) / 10 ** 6) / Number(owned[idx]) * 1000) / 1000)));
}

export const calculateCost = (market) => {
    return Math.sqrt(market.shares.map(a => a ** 2).reduce((a, b) => a + b, 0))
}

export const calculatePrice = (market, outcome) => {
    return Math.max(1, market.shares[market.outcomes.indexOf(outcome)]) / calculateCost(market)
}

export const fetchOrders = async (refresh, activeContract, activeMarketId) => {
    let betOrders = refresh ? [] : (betOrders || []);
    const contractOrders = await activeContract.getOrders(activeMarketId || "", betOrders.length, 100);
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

export const groupOrders = (orders) => {
    const grouped = [];
    orders.forEach(o => {
        const {outcome, orderPosition, amount, pricePerShare} = o;
        const update = grouped.filter(g => g.orderPosition === orderPosition && g.pricePerShare === pricePerShare && g.outcome === outcome)[0];
        if (update) {
            update.amount += amount;
        } else {
            grouped.push(o);
        }
    });
    return grouped;
}

export const fillOrder = async (activeContract, activeMarketId, cart, orders) => {
    const newOrders = cart.filter(order => order.shares > 0n);
    // Sells should be filled before buys
    newOrders.sort((a, b) => a.action < b.action ? 1 : a.price - b.price);
    const prices = newOrders.map(o => o.price * 1e6);
    const amounts = await Promise.all(newOrders.map(o => o.shares));
    const orderIndexes = cart.map(({action, outcome, price}) => orders
        .filter(o => o.amount)
        .filter(o => o.outcome === outcome)
        .filter(o => o.orderPosition !== action)
        .filter(o => price === 0 || (action === "BUY" ? (price >= o.pricePerShare) : (price <= o.pricePerShare)))
        .map(o => o.idx));
    //console.log(amounts, prices, cart.map(o => o.action === "BUY" ? 0n : 1n), activeMarketId, newOrders.map(o => o.outcome), orderIndexes);
    localStorage.txPool = `Processing pending orders...`;
    localStorage.txConfirmed = `Order completed! Market will be updated shortly`;
    await activeContract.fillOrder(amounts, prices, cart.map(o => o.action === "BUY" ? 0n : 1n), activeMarketId, newOrders.map(o => o.outcome), orderIndexes);
}

export const createBet = async (activeContract, usdc, owner, ooContractAddress, schema, address, marketId, deadline, schedule, initialPool, outcomes, ratios, marketTitle, marketTerms, marketImage, outcomeImages) => {
    try {
        schedule = Date.parse(schedule) / 1000;
        deadline = Date.parse(deadline) / 1000;
        marketId = marketId.toLowerCase().trim();

        /*
        if ((await getMarket(marketId, activeContract)).created) {
            return "Bet ID already exists";
        }
        */

        switch (schema) {
            /*
            case "bc":
                await activeContract.createHumanBet("0x07865c6E87B9F70255377e024ace6630C1Eaa37F", marketId, deadline, schedule, commissionDenominator, commission, initialPool, query).then(tx => tx.wait());
                break;
            */
            case "oo":
                await activeContract.createOptimisticBet(address, marketId, deadline, schedule, initialPool, outcomes, ratios, marketTitle, marketTerms, marketImage, outcomeImages);
        }
    } catch (error) {
        console.error(error);
        //triggerError(providerErrorMsg(error), createBetQuery);
    }
}

