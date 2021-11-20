import { Component, Input, OnInit } from '@angular/core';
import { Loan } from 'src/app/model/loan';

@Component({
  selector: 'app-simulation-loan-amount',
  templateUrl: './simulation-loan-amount.component.html',
  styleUrls: ['./simulation-loan-amount.component.css']
})
export class SimulationLoanAmountComponent implements OnInit {
    
    @Input() symulacja!: Loan[];

    get loanMonths(): number {
        if(this.symulacja && this.symulacja[0])
        {
            return this.symulacja[0].harmonogram.length;
        }
        
        return 0;
      }
      
    simulationDisplayedColumns: string[] = ['stopaProcentowa','kwota',  'rata', 'rataOdsetki', 'rataKapital', '10odsetki', '10kapital', 'odsetkiSuma', 'calyKoszt'];
  constructor() { }

  ngOnInit() {
  }

}
