import HttpException from "../exceptions/http.exception";
import Transaction from "../models/transaction.model"

export async function getTransactions(limit: number, offset: number){
    return await Transaction.find({},'-_id')
        .sort({confirmation_block:-1})
        .skip(offset)
        .limit(limit)
        .select('transaction_id created_at sender receiver amount')
        .catch(err => {throw new HttpException(500, err)});
}

export async function getTransaction(transactionId: string){
    const transaction = await Transaction.findOne({transaction_id: transactionId}, '-_id -__v')
        .catch(err => {throw new HttpException(500, err.message)});
    if(!transaction){
        throw new HttpException(404, "Transaction does not exist!");
    }

    return transaction;
}

export async function getTransactionsByCreationHeight(height:number){
    return await Transaction.find({confirmation_block:height}, '-_id -__v')
        .catch(err => {throw new HttpException(500, err.message)});   
}

export async function getTransactionsPerDay(){
    return await Transaction.aggregate([
        {
            $group:{
                _id:{
                     $dateToString: { format: "%Y-%m-%d", date: "$created_at" } ,
                },
                transactions_count:{ $sum:1 }

            }
        },
        {
            $sort:{
                _id:1
            }
        }
    ])
    .catch(err => {throw new HttpException(500, err.message)});
}