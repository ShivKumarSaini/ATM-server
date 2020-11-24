const Constants = require('../services/constants.service');

class CashDispenserHandler {
    constructor() {
        try {
            this.cashTray = Constants.allBills() || {};
            this.validBills = Object.keys(this.cashTray).map(b => parseInt(b, 10)) || [];
            this.totalSumAvailable = this.calcCurrentTotalSum(this.cashTray);
            console.log(`Total cash: ${this.totalSumAvailable}`);
        } catch (x) {
            console.error(`Error while initializing CashDispenserHandler: ${x}`);
        }
    }

    billsInDescOrder() {
        return (this.validBills.sort((a, b) => b - a)) || [];
    }

    calcCurrentTotalSum() {
        let sum = 0;
        for (let val of Object.keys(this.cashTray)) {
            sum += (val * this.cashTray[val]);
        }

        this.totalSumAvailable = sum;
        return sum;
    }

    validateInputs(body) {
        if (!body || body == {})
            return { isValid: false, message: "Invalid request body.", statusCode: 400 };
        else if (!body.amount)
            return { isValid: false, message: "Invalid input, 'Amount' field is mandatory.", statusCode: 400 };
        else if (isNaN(parseInt(body.amount, 10)))
            return { isValid: false, message: "Invalid value for amount.", statusCode: 400 };
        else if (body.amount < 100)
            return { isValid: false, message: "Amount cannot be less than 100.", statusCode: 400 };
        else if ((body.amount % 100) != 0)
            return { isValid: false, message: "Amount must be a multiple of 100.", statusCode: 400 };
        else if (body.amount > this.totalSumAvailable)
            return { isValid: false, message: `Unable to dispense the amount requested. Total dispense capacity now is ${this.totalSumAvailable}.`, statusCode: 400 };
        else
            return { isValid: true, message: "Valid Input" }
    }

    createDenominations({ restAmount }) {
        let denominations = {};
        for (let bill of this.billsInDescOrder()) {
            const dividend = parseInt((restAmount / bill), 10);
            const numbersOfBill = (dividend <= this.cashTray[bill] && dividend > 0)
                ? dividend
                : dividend > 0
                    ? this.cashTray[bill]
                    : 0;

            if (numbersOfBill <= 0)
                continue;

            denominations[bill] = numbersOfBill;
            restAmount -= (bill * denominations[bill]);

            if (restAmount === 0)
                break;
        }
        return { denominations, restAmount };
    }

    withdrawCash(req, res, next) {
        try {
            const inputValidity = this.validateInputs(req.body);
            if (!inputValidity.isValid) {
                res.status(inputValidity.statusCode)
                    .send({ error: inputValidity.message, message: 'Bad Request', data: null });
                console.error(`Input Validation Error: ${inputValidity.message}`);
                return;
            }
            const amountToDispense = req.body.amount;
            let denominations = {}, restAmount = amountToDispense, output;
            if (this.validBills.indexOf(amountToDispense) >= 0) {
                if (this.cashTray[amountToDispense] > 0) {
                    denominations[amountToDispense] = 1;
                    restAmount -= amountToDispense * 1;
                } else {
                    output = this.createDenominations({ restAmount });
                    denominations = output.denominations;
                    restAmount = output.restAmount;
                }
            } else {
                output = this.createDenominations({ restAmount });
                denominations = output.denominations;
                restAmount = output.restAmount;
            }

            if (restAmount !== 0) {
                denominations = {};
                console.error(`Current status of Cash Tray: ${JSON.stringify(this.cashTray)}`);
                throw new Error(`Shortage of required currency bills to dispense the amount. Hence, unable to dispense Full Amount. Transaction ABORTED!`);
            }

            this.updateCashTrayBeforeDispensing(denominations);
            console.log(`Amount ${amountToDispense} is dispensed to user. Current dispense capacity:  ${this.totalSumAvailable}`);

            res.status(200).send({ error: null, message: 'Success', data: denominations });

        } catch (wcx) {
            console.error(`Error while dispensing cash: ${wcx}`);
            res.status(500).send({ error: wcx.message || wcx, message: wcx.message || 'Cash-dispenser Error', data: null });
        }
    }

    updateCashTrayBeforeDispensing(outwardPay) {
        this.validBills.map(bill => this.cashTray[bill] -= (outwardPay[bill] || 0));
        this.calcCurrentTotalSum();
    }
}

module.exports = (new CashDispenserHandler());