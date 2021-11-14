import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Loan, RataMiesieczna } from './model/loan';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    timeout: any;
    _loanAmount: number = 400000;
    loanAmountMax: number = 1000000;
    loanAmountMin: number = 10000;

    get loanAmount(): number {
        return this._loanAmount;
    }
    set loanAmount(value: number) {
        this._loanAmount = +value;
        this.startRecalculate();
    }
    loanYearsMin: number = 1;
    loanYearsMax: number = 30;
    _loanYears: number = 30;

    get loanYears(): number {
        return this._loanYears;
    }
    set loanYears(value: number) {
        this._loanYears = +value;
        this.startRecalculate();
    }

    interestRateMin: number = 0.5;
    interestRateMax: number = 30;
    _interestRate: number = 3.25;

    get interestRate(): number {
        return this._interestRate;
    }
    set interestRate(value: number) {
        this._interestRate = +value;
        this.startRecalculate();
    }

    loan: Loan;

    symulacja: Loan[] = [];

    symulacjaAktualnyMiesiac : number = 1;
    get symulacjaAktualnyRok(): number {
        return Math.ceil(this.symulacjaAktualnyMiesiac / 12);
    }

    get symulacjaAktualnyMiesiacObjekt(): RataMiesieczna {
        return this.loan.harmonogram[this.symulacjaAktualnyMiesiac - 1];
    }

    get symulacjaZaplaconeOdsetki(): number {
        const since1toCurrent = this.loan.harmonogram.slice(0, this.symulacjaAktualnyMiesiac);
        return since1toCurrent.map(o=> o.odsetki).reduce((a,c)=>a + c);;
    }

    displayedColumns: string[] = ['miesiac', 'kwota', 'odsetki', 'kapital'];

    simulationDisplayedColumns: string[] = ['stopaProcentowa', 'rata', 'rataOdsetki', 'rataKapital', '10odsetki', '10kapital', 'odsetkiSuma', 'calyKoszt'];

    constructor(private router: Router, private activatedRoute: ActivatedRoute) {
        this.loan = new Loan(this.loanAmount, this.loanYears * 12, this.interestRate);
    }

    ngOnInit(): void {

        setTimeout(() => {
            
            const kwota: string | null = this.activatedRoute.snapshot.queryParamMap.get('kwota');
            const okres: string | null = this.activatedRoute.snapshot.queryParamMap.get('okres');
            const oprocentowanie: string | null= this.activatedRoute.snapshot.queryParamMap.get('oprocentowanie');

            if(kwota && !Number.isNaN(kwota))
            {
                this.loanAmount = +(kwota)
            }

            if(okres && !Number.isNaN(okres))
            {
                this.loanYears = +(okres)
            }

            if(oprocentowanie && !Number.isNaN(oprocentowanie))
            {
                this.interestRate = +(oprocentowanie)
            }

            this.recalculateLoan(this.loanAmount, this.loanYears, this.interestRate);

          });

    }

    appendAQueryParam() {

        const urlTree = this.router.createUrlTree([], {
           queryParams: {
              kwota: this.loanAmount,
              okres: this.loanYears,
              oprocentowanie: this.interestRate
           },
           queryParamsHandling: "merge",
           preserveFragment: true
        });
     
        this.router.navigateByUrl(urlTree);
     }

    startRecalculate() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.recalculateLoan(this.loanAmount, this.loanYears, this.interestRate), 100);
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
        return value.toFixed(2).replace('.',',') + '%'
    }

    recalculateLoan(loanAmount:number, loanYears:number, interestRate:number) {
        this.appendAQueryParam();
        this.symulacja = [];
        this.symulacjaAktualnyMiesiac = 1;
        this.loan = new Loan(loanAmount, loanYears * 12, interestRate);

        let rates: number[] = [];

        let tempRate = this.interestRate;
        
        for (let i = 1; i <= 8; i++) {

            tempRate  = tempRate - 0.25;

            let rate = +(tempRate.toFixed(2));
            
            if(rate > 0)
            {
                rates.push(rate);
            }
        }

        for (let i = tempRate - 1; i >  0; i--) {

            let rate = +(i.toFixed(2));

            if(rate > 0)
            {
                rates.push(rate);
            }
        }

        tempRate = this.interestRate;

        for (let i = 1; i <= 8; i++) {
            tempRate  = tempRate + 0.25;

            let rate = +(tempRate.toFixed(2));
            
            if(rate > 0)
            {
                rates.push(rate);
            }
        
        }

        for (let i = tempRate + 1; i <= 20; i++) {
            rates.push(+(i.toFixed(2)));
        }

        rates.push(this.interestRate);
        
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

        console.log(unique);
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

    changeAmountInput(val:any)
    {
        let changedValue = +(val.target.value);

        if(!Number.isNaN(changedValue))
        {
            if(changedValue >= this.loanAmountMin && changedValue <= this.loanAmountMax)
            {
                this.loanAmount = changedValue;
            }
            else if(changedValue < this.loanAmountMin)
            {
                this.loanAmount = this.loanAmountMin;
            }
            else if(changedValue > this.loanAmountMax)
            {
                this.loanAmount = this.loanAmountMax;
            } 
        }
       
        val.target.value = this.loanAmount;
    }


    changeYears(changedYears: number): void {
        this.loanYears = this.loanYears + changedYears;

        if (this.loanYears < this.loanYearsMin) {
            this.loanYears = this.loanYearsMin;
        }

        if (this.loanYears > this.loanYearsMax) {
            this.loanYears = this.loanYearsMax;
        }
    }

    changeYearsInput(val:any)
    {
        let changedValue = +(val.target.value);

        if(!Number.isNaN(changedValue))
        {
            if(changedValue >= this.loanYearsMin && changedValue <= this.loanYearsMax)
            {
                this.loanYears = changedValue;
            }
            else if(changedValue < this.loanYearsMin)
            {
                this.loanYears = this.loanYearsMin;
            }
            else if(changedValue > this.loanYearsMax)
            {
                this.loanYears = this.loanYearsMax;
            } 
        }
       
        val.target.value = this.loanYears;
    }

    isValidInt(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if(charCode >= 48 && charCode <= 57)
        {
            return  true
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

    isValidPercent(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
    
        if((charCode >= 48 && charCode <= 57) || charCode == 46 || charCode == 44)
        {
            return  true
        }

        return false;

    }

    changePercentInput(val:any)
    {

        val.target.value = val.target.value.replace(',','.');

        let changedValue = +(val.target.value);


        if(!Number.isNaN(changedValue))
        {
            if(changedValue >= this.interestRateMin && changedValue <= this.interestRateMax)
            {
                this.interestRate = changedValue;
            }
            else if(changedValue < this.interestRateMin)
            {
                this.interestRate = this.interestRateMin;
            }
            else if(changedValue > this.interestRateMax)
            {
                this.interestRate = this.interestRateMax;
            } 
        }
       
        val.target.value = this.interestRate;
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

    changeSimulationMonthInput(val:any)
    {
        let changedValue = +(val.target.value);

        if(!Number.isNaN(changedValue))
        {
            if(changedValue >= 1 && changedValue <= this.loan.months)
            {
                this.symulacjaAktualnyMiesiac = changedValue;
            }
            else if(changedValue < 1)
            {
                this.symulacjaAktualnyMiesiac = 1;
            }
            else if(changedValue > this.loan.months)
            {
                this.symulacjaAktualnyMiesiac = this.loan.months;
            } 
        }
       
        val.target.value = this.symulacjaAktualnyMiesiac;
    }

}
