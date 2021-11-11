import { Component, OnInit } from '@angular/core';
import { Loan } from './model/loan';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  title = 'loan-simulator';
  loanAmount: number = 400000;
  loanYears: number = 30;
  interestRate: number = 3.25;
  loan: Loan;

  symulacja: Loan[] = [];

  displayedColumns: string[] = ['miesiac', 'kwota', 'odsetki', 'kapital'];

  simulationDisplayedColumns: string[] = ['stopaProcentowa', 'rata', 'rataOdsetki', 'rataKapital','10odsetki', '10kapital','odsetkiSuma','calyKoszt'];

  constructor() {
    this.loan = new Loan(this.loanAmount, this.loanYears*12, this.interestRate);
  }
    ngOnInit(): void {
        this.recalculateLoan();
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

  recalculateLoan(){
    this.symulacja = [];
    this.loan = new Loan(this.loanAmount, this.loanYears*12, this.interestRate);

    let rates:number[]=[];

    for (let i = this.interestRate; i > 0; i--) {
        let r = +Math.floor(i);

        if(r > 0)
        {
            rates.push(r);
        }
        
    }

    rates.push(this.interestRate);

    for (let i = this.interestRate + 1 ; i <= 26; i++) {
        rates.push(+Math.floor(i));
    }

    let unique = [...new Set(rates)];

     unique.sort(function(a, b) {
        return a - b;
     });

     unique.forEach( (rate) => {
        let loan = new Loan(this.loanAmount, this.loanYears*12, rate, this.loan);

        if(rate == this.interestRate)
        {
            loan.current = true;
        }
        
        this.symulacja.push(loan);
    });
  }


}
