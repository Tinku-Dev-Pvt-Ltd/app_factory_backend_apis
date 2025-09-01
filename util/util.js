const { uniqString } = require("../util/helper");
let wallet_transaction = require("../service/wallet_transaction");

const generate_transaction = async (user_id, user_name, amount, transaction_type, challenege_id = null) => {
    console.log('generate transaction started ...');
    try {

        let wallet_exist = await wallet_transaction().fetch_by_query({ user_id });
        console.log("wallet_exist ==>", wallet_exist)

        if (wallet_exist == null) wallet_exist = await wallet_transaction().add({ user_id, amount: 0 });

        let wallet_amount = wallet_exist.wallet_amount;

        let transaction_payload = {
            uniq_id: `${user_name.substring(0, 3).toUpperCase()}${uniqString()}`,
            user_id: user_id,
            wallet_id: wallet_exist._id,
            challenege_id: challenege_id,
            amount: amount,
            transaction_type: transaction_type,                    // 1: Money added, 2: withdraw, 3:challenges money deduct, 4:wining amount added
            amount_type: [1, 4].includes(transaction_type) ? 1 : 2   // 1: Credit, 2: Debit       
        };

        if ([1, 4].includes(transaction_type)) { wallet_amount += amount; }
        if ([2, 3].includes(transaction_type)) { wallet_amount -= amount; }


        let [data, update_result] = await Promise.all([
            wallet_transaction().create_transaction(transaction_payload),
            wallet_transaction().update({ user_id }, { wallet_amount: wallet_amount })
        ]);

        console.log("data ==>", data)
        return { data, wallet: update_result };

    } catch (err) {
        console.log("\n =-=-=-=-=-=-=-=- error =-=-=-=-=-=-=-=- ");
        console.log(err)
    }
}

const generate_query = (type) => {
    console.log('type ==>', type)

    const now = new Date();
    let start_date, end_date = new Date();

    switch (type) {
        case 1: // 1. From last minute (today)
            start_date = new Date(now.setHours(0,0,0,0)); // from 12 AM
            break;

        case 2: // 2. Last 7 days
            start_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
            start_date.setHours(0, 0, 0, 0); // start of that day
            break;

        case 3: // 3. This month
            start_date = new Date(now.getFullYear(), now.getMonth(), 1); // start of month
            break;

        default:
            throw new Error("Invalid filter type");
    }

    return { "createdAt": { $gte: start_date, $lte: end_date } };
}


module.exports = {
    generate_transaction,
    generate_query
}