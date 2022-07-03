import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Loan, RataMiesieczna } from './model/loan';
import { LoanType } from './model/type';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    timeout: any;
    _type: string = "stałe";
    _loanAmount: number = 500000;
    loanAmountMax: number = 2000000;
    loanAmountMin: number = 10000;
    selectedTabIndex = 0;
    isReady = false;

    get type(): string {
        return this._type;
    }
    set type(value: string) {
        this._type = value;
        this.startRecalculate();
    }

    get loanType(): LoanType {
        if (this.type == "stałe") {
            return LoanType.Constant;
        }

        if (this.type == "malejące") {
            return LoanType.Decreasing;
        }

        return LoanType.None;
    }

    get loanAmount(): number {
        return this._loanAmount;
    }
    set loanAmount(value: number) {
        this._loanAmount = +value;
        this.startRecalculate();
    }
    loanMonthsMin: number = 1;
    loanMonthsMax: number = 420;
    _loanMonths: number = 360;

    get loanMonths(): number {
        return this._loanMonths;
    }
    set loanMonths(value: number) {
        this._loanMonths = +value;
        this.startRecalculate();
    }

    get loanYears(): number {
        return Math.floor(this.loanMonths / 12);
    }

    get loanYearsRestMonths(): number {
        return this.loanMonths - (this.loanYears * 12);
    }

    interestRateMin: number = 0.0;
    interestRateMax: number = 30;
    _interestRate: number = 7.00;

    get interestRate(): number {
        return this._interestRate;
    }
    set interestRate(value: number) {
        this._interestRate = +value;
        this.startRecalculate();
    }

    marginMin: number = 0.1;
    marginMax: number = 10;
    _margin: number = 2.0;

    get margin(): number {
        return this._margin;
    }
    set margin(value: number) {
        this._margin = +value;
        this.startRecalculate();
    }

    get interest(): number {
        let temp = this._interestRate + this.margin;

        if(temp < 0)
        {
            temp = 0;
        }

        return temp;
    }

    loan: Loan;

    symulacja: Loan[] = [];
    symulacja2: Loan[] = [];
    symulacjaKwoty: Loan[] = [];

    symulacjaAktualnyMiesiac: number = 1;
    get symulacjaAktualnyRok(): number {
        return Math.ceil(this.symulacjaAktualnyMiesiac / 12);
    }

    get symulacjaAktualnyMiesiacObjekt(): RataMiesieczna {
        return this.loan.harmonogram[this.symulacjaAktualnyMiesiac - 1];
    }

    get symulacjaZaplaconeOdsetki(): number {
        const since1toCurrent = this.loan.harmonogram.slice(0, this.symulacjaAktualnyMiesiac);
        return since1toCurrent.map(o => o.odsetki).reduce((a, c) => a + c);;
    }

    constructor(private router: Router, private activatedRoute: ActivatedRoute) {
        this.loan = new Loan(this.loanType, this.loanAmount, this.loanMonths, this.interest);
    }

    ngOnInit(): void {

        setTimeout(() => {

            const kwota: string | null = this.activatedRoute.snapshot.queryParamMap.get('kwota');
            const okres: string | null = this.activatedRoute.snapshot.queryParamMap.get('okres');
            const WIBOR: string | null = this.activatedRoute.snapshot.queryParamMap.get('WIBOR');
            const marza: string | null = this.activatedRoute.snapshot.queryParamMap.get('marża');
            const typRat: string | null = this.activatedRoute.snapshot.queryParamMap.get('typRat');

            if (kwota && !Number.isNaN(kwota)) {
                this.loanAmount = +(kwota)
            }

            if (okres && !Number.isNaN(okres)) {
                this.loanMonths = +(okres)
            }

            if (WIBOR && !Number.isNaN(WIBOR)) {
                this.interestRate = +(WIBOR)
            }

            if (marza && !Number.isNaN(marza)) {
                this.margin = +(marza)
            }

            if (typRat && (typRat == 'stałe' || typRat == 'malejące')) {
                this.type = typRat;
            }

            this.startRecalculate();

        });

    }

    appendAQueryParam() {

        const urlTree = this.router.createUrlTree([], {
            queryParams: {
                kwota: this.loanAmount,
                okres: this.loanMonths,
                WIBOR: this.interestRate,
                marża: this.margin,
                typRat: this.type
            },
            queryParamsHandling: "merge",
            preserveFragment: true
        });

        this.router.navigateByUrl(urlTree);
    }

    startRecalculate() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.recalculateLoan(this.loanAmount, this.loanMonths, this.interest), 1000);
    }

    formatAmount(loanAmount: number) {
        if (loanAmount >= 1000 && loanAmount < 1000000) {
            return Math.round(loanAmount / 1000) + 'k';
        }

        if (loanAmount >= 1000000) {
            return loanAmount / 1000000 + 'M';
        }

        return loanAmount;
    }

    formatIntersetRate(value: number) {
        return value.toFixed(2).replace('.', ',') + '%'
    }

    formatMarginRate(value: number) {
        return value.toFixed(2).replace('.', ',') + '%'
    }

    recalculateLoan(loanAmount: number, loanMonths: number, interestRate: number) {
        this.isReady = false;
        this.appendAQueryParam();
        this.symulacja = [];
        this.symulacja2 = [];
        this.symulacjaKwoty = [];
        this.symulacjaAktualnyMiesiac = 1;
        this.loan = new Loan(this.loanType, loanAmount, loanMonths, interestRate);

        let rates: number[] = [];

        let tempRate = this.interest;

        for (let i = 1; i <= 8; i++) {

            tempRate = tempRate - 0.25;

            let rate = +(tempRate.toFixed(2));

            if (rate > 0) {
                rates.push(rate);
            }
        }

        for (let i = tempRate - 1; i > 0; i--) {

            let rate = +(i.toFixed(2));

            if (rate > 0) {
                rates.push(rate);
            }
        }

        tempRate = this.interest;

        for (let i = 1; i <= 8; i++) {
            tempRate = tempRate + 0.25;

            let rate = +(tempRate.toFixed(2));

            if (rate > 0) {
                rates.push(rate);
            }

        }

        for (let i = tempRate + 1; i <= 20; i++) {
            rates.push(+(i.toFixed(2)));
        }

        rates.push(this.interest);

        let unique = [...new Set(rates)];

        unique = unique.sort(function (a, b) {
            return a - b;
        });

        if (this.selectedTabIndex == 0) {

            unique.forEach((rate) => {
                let loan = new Loan(this.loanType, this.loanAmount, this.loanMonths, rate, this.loan);

                if (rate == this.interest) {
                    loan.current = true;
                }

                this.symulacja.push(loan);
            });
        }

        if (this.selectedTabIndex == 2) {

            let maxAmount = 1000000; 

            unique.forEach((rate) => {

                let loan = null;

                if (rate == this.interest) {
                    this.loan.current = true;
                    this.symulacja2.push(this.loan);
                }
                else {
                
                    for (let amount = 0; amount <= maxAmount; amount += 100) {

                        loan = new Loan(this.loanType, amount, this.loanMonths, rate, this.loan, true);

                        if (loan.pierwszaRata && this.loan.pierwszaRata) {

                            let tempPayment = Math.floor(loan.pierwszaRata.rataKredytu);
                            let loanPayment = Math.floor(this.loan.pierwszaRata.rataKredytu);

                            if (tempPayment == loanPayment) {

                                loan = new Loan(this.loanType, amount, this.loanMonths, rate, this.loan);

                                maxAmount = loan.amount;
                                this.symulacja2.push(loan);

                                break;
                            }
                        }
                    }
                }

            });
        }

        if (this.selectedTabIndex == 3) {
            this.symulacjaKwoty.push(new Loan(this.loanType, 100000, loanMonths, interestRate));
            this.symulacjaKwoty.push(new Loan(this.loanType, 200000, loanMonths, interestRate));
            this.symulacjaKwoty.push(new Loan(this.loanType, 300000, loanMonths, interestRate));
            this.symulacjaKwoty.push(new Loan(this.loanType, 400000, loanMonths, interestRate));
            this.symulacjaKwoty.push(new Loan(this.loanType, 500000, loanMonths, interestRate));
            this.symulacjaKwoty.push(new Loan(this.loanType, 600000, loanMonths, interestRate));
            this.symulacjaKwoty.push(new Loan(this.loanType, 700000, loanMonths, interestRate));
            this.symulacjaKwoty.push(new Loan(this.loanType, 1000000, loanMonths, interestRate));
            this.symulacjaKwoty.push(new Loan(this.loanType, 2000000, loanMonths, interestRate));
        }

        


        this.isReady = true;
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

    changeAmountInput(val: any) {
        let changedValue = +(val.target.value.replace(/\s/g, ''));

        if (!Number.isNaN(changedValue)) {
            if (changedValue >= this.loanAmountMin && changedValue <= this.loanAmountMax) {
                this.loanAmount = changedValue;
            }
            else if (changedValue < this.loanAmountMin) {
                this.loanAmount = this.loanAmountMin;
            }
            else if (changedValue > this.loanAmountMax) {
                this.loanAmount = this.loanAmountMax;
            }
        }

        val.target.value = this.loanAmount;
    }


    changeMonths(changedMonths: number): void {
        this.loanMonths = this.loanMonths + changedMonths;

        if (this.loanMonths < this.loanMonthsMin) {
            this.loanMonths = this.loanMonthsMin;
        }

        if (this.loanMonths > this.loanMonthsMax) {
            this.loanMonths = this.loanMonthsMax;
        }
    }

    changeMonthsInput(val: any) {
        let changedValue = +(val.target.value.replace(/\s/g, ''));

        if (!Number.isNaN(changedValue)) {
            if (changedValue >= this.loanMonthsMin && changedValue <= this.loanMonthsMax) {
                this.loanMonths = changedValue;
            }
            else if (changedValue < this.loanMonthsMin) {
                this.loanMonths = this.loanMonthsMin;
            }
            else if (changedValue > this.loanMonthsMax) {
                this.loanMonths = this.loanMonthsMax;
            }
        }

        val.target.value = this.loanMonths;
    }

    isValidInt(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode >= 48 && charCode <= 57) {
            return true
        }

        return false;
    }

    changePercent(changedPercent: number): void {
        this.interestRate = +(this.interestRate + changedPercent).toFixed(2);

        if (this.interestRate < this.interestRateMin) {
            this.interestRate = this.interestRateMin;
        }

        if (this.interestRate > this.interestRateMax) {
            this.interestRate = this.interestRateMax;
        }
    }

    changeMargin(changedMargin: number): void {
        this.margin = +(this.margin + changedMargin).toFixed(2);

        if (this.margin < this.marginMin) {
            this.margin = this.marginMin;
        }

        if (this.margin > this.marginMax) {
            this.margin = this.marginMax;
        }
    }

    isValidPercent(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;

        if ((charCode >= 48 && charCode <= 57) || charCode == 46 || charCode == 44) {
            return true
        }

        return false;

    }

    changePercentInput(val: any) {

        val.target.value = val.target.value.replace(',', '.').replace(/\s/g, '');

        let changedValue = +(val.target.value);


        if (!Number.isNaN(changedValue)) {
            if (changedValue >= this.interestRateMin && changedValue <= this.interestRateMax) {
                this.interestRate = changedValue;
            }
            else if (changedValue < this.interestRateMin) {
                this.interestRate = this.interestRateMin;
            }
            else if (changedValue > this.interestRateMax) {
                this.interestRate = this.interestRateMax;
            }
        }

        val.target.value = this.interestRate;
    }

    changeMarginInput(val: any) {

        val.target.value = val.target.value.replace(',', '.');

        let changedValue = +(val.target.value);


        if (!Number.isNaN(changedValue)) {
            if (changedValue >= this.marginMin && changedValue <= this.marginMax) {
                this.margin = changedValue;
            }
            else if (changedValue < this.marginMin) {
                this.margin = this.marginMin;
            }
            else if (changedValue > this.marginMax) {
                this.margin = this.marginMax;
            }
        }

        val.target.value = this.margin;
    }


    changeSimulationMonth(changedMonth: number): void {
        this.symulacjaAktualnyMiesiac = this.symulacjaAktualnyMiesiac + changedMonth;

        if (this.symulacjaAktualnyMiesiac < 1) {
            this.symulacjaAktualnyMiesiac = 1;
        }

        if (this.symulacjaAktualnyMiesiac > this.loan.months) {
            this.symulacjaAktualnyMiesiac = this.loan.months;
        }
    }

    changeSimulationMonthInput(val: any) {
        let changedValue = +(val.target.value);

        if (!Number.isNaN(changedValue)) {
            if (changedValue >= 1 && changedValue <= this.loan.months) {
                this.symulacjaAktualnyMiesiac = changedValue;
            }
            else if (changedValue < 1) {
                this.symulacjaAktualnyMiesiac = 1;
            }
            else if (changedValue > this.loan.months) {
                this.symulacjaAktualnyMiesiac = this.loan.months;
            }
        }

        val.target.value = this.symulacjaAktualnyMiesiac;
    }

    public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
        this.selectedTabIndex = tabChangeEvent.index;
        this.isReady = false;
        this.startRecalculate();
    }

}
