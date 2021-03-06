
import { CoinRecord } from "chia-client/dist/src/types/FullNode/CoinRecord";
import mongoose, { HookNextFunction } from "mongoose"
import { addTransactionToAddress, removeTransactionFromAddress } from "../services/address.service";
import { getCoinInfo } from "../services/full.node.service";
import Address from "./address.model";


export interface ITransaction extends mongoose.Document {

    transaction_id:string,
    created_at:Date,
    confirmation_block:number,
    amount:number,
    confirmations_number:number,

    input:CoinRecord,
    outputs:CoinRecord[]

    sender:string,
    receiver:string,
}

const transactionSchema = new mongoose.Schema({
    transaction_id: { 
        type:String,
        required:true,
        unique:true
    },
    confirmation_block:{
        type: Number,
        required:true
    },
    created_at:{
        type: Date,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    confirmations_number:{
        type:Number,
        required:true
    },
    sender:{
        type:String,
        required:true
    },
    receiver: {
        type:String,
        required:true
    },
    input: {
        type:Object,
    },
    outputs: [
        {
            type:Object,
        }
    ]
});


transactionSchema.post<ITransaction>('save', async function(next:HookNextFunction){
    const self:any = this;
    if(self.input){
        const parent_info = await getCoinInfo(self.input.parent_coin_info, self.input.puzzle_hash, self.input.amount);

            await Promise.all([
                Transaction.updateOne(
                    {transaction_id:parent_info},
                    {$push:
                        {
                            outputs:{
                                address:self.receiver,
                                amount: self.amount
                            }
                        }
                    }),

                addTransactionToAddress(self,true)
            ])
    }
    await addTransactionToAddress(self,false);
    
})
""
transactionSchema.pre<ITransaction>('remove', async function(next:HookNextFunction){
    if(this.sender !== " "){
        await removeTransactionFromAddress(this, true);
    }
    await removeTransactionFromAddress(this,false);
})


const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);



export default Transaction;