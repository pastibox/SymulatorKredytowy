import { Component, Input, OnInit } from '@angular/core';
import { Loan } from 'src/app/model/loan';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent implements OnInit {
  @Input() symulacja!: Loan[];

  get loanMonths(): number {
      if(this.symulacja && this.symulacja[0])
      {
          return this.symulacja[0].harmonogram.length;
      }
      
      return 0;
    }
    
  simulationDisplayedColumns: string[] = ['stopaProcentowa', 'rata', 'rataOdsetki', 'rataKapital', '10odsetki', '10kapital', 'odsetkiSuma', 'calyKoszt'];
  
  constructor() { }

  ngOnInit() {
  }

}
