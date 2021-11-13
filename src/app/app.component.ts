import { Component, OnInit } from '@angular/core';
import { Loan } from './model/loan';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    title = 'loan-simulator';
    loanAmountMax: number = 1000000;
    loanAmountMin: number = 10000;
    _loanAmount: number = 400000;

    timeout: any;

    get loanAmount(): number {
        return this._loanAmount;
    }
    set loanAmount(value: number) {
        this._loanAmount = +value;
        //this.recalculateLoan();
        this.startTimer();
    }

    loanYears: number = 30;
    interestRate: number = 3.25;
    loan: Loan;

    symulacja: Loan[] = [];

    displayedColumns: string[] = ['miesiac', 'kwota', 'odsetki', 'kapital'];

    simulationDisplayedColumns: string[] = ['stopaProcentowa', 'rata', 'rataOdsetki', 'rataKapital', '10odsetki', '10kapital', 'odsetkiSuma', 'calyKoszt'];

    constructor() {
        this.loan = new Loan(this.loanAmount, this.loanYears * 12, this.interestRate);
    }
    ngOnInit(): void {
        this.recalculateLoan(this.loanAmount, this.loanYears, this.interestRate);
    }

    startTimer() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.recalculateLoan(this.loanAmount, this.loanYears, this.interestRate), 300);
    }

    formatAmount(loanAmount: number) {
        if (loanAmount >= 1000 && loanAmount < 1000000) {
            return Math.round(loanAmount / 1000) + 'k';
        }

        if (loanAmount >= 1000000) {
            return Math.round(loanAmount / 1000000) + 'm';
        }

        return loanAmount;
    }

    formatIntersetRate(value: number) {
        return value + '%'
    }

    recalculateLoan(loanAmount:number, loanYears:number, interestRate:number) {
        this.symulacja = [];
        this.loan = new Loan(loanAmount, loanYears * 12, interestRate);

        let rates: number[] = [];

        for (let i = this.interestRate; i > 0; i--) {
            let r = +Math.floor(i);

            if (r > 0) {
                rates.push(r);
            }

        }

        rates.push(this.interestRate);

        for (let i = this.interestRate + 1; i <= 26; i++) {
            rates.push(+Math.floor(i));
        }

        let unique = [...new Set(rates)];

        unique.sort(function (a, b) {
            return a - b;
        });

        unique.forEach((rate) => {
            let loan = new Loan(this.loanAmount, this.loanYears * 12, rate, this.loan);

            if (rate == this.interestRate) {
                loan.current = true;
            }

            this.symulacja.push(loan);
        });
    }

    changeAmount(changedAmount: number): void {
        this.loanAmount = this.loanAmount + changedAmount;

        if (this.loanAmount < this.loanAmountMin) {
            this.loanAmount = this.loanAmountMin;
        }

        if (this.loanAmount > this.loanAmountMax) {
            this.loanAmount = this.loanAmountMax;
        }
    }

    isValidAmount(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        let newValue = +(this.loanAmount + String.fromCharCode(charCode));
        if(newValue > this.loanAmountMax)
        {
            return false;
        }

        return true;

    }

}
