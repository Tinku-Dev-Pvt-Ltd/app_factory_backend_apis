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

module.exports = {
    generate_transaction,
}