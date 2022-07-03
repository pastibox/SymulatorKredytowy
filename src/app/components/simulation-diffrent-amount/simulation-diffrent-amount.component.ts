import { Component, Input, OnInit } from '@angular/core';
import { Loan } from 'src/app/model/loan';

@Component({
  selector: 'app-simulation-diffrent-amount',
  templateUrl: './simulation-diffrent-amount.component.html',
  styleUrls: ['./simulation-diffrent-amount.component.css']
})
export class SimulationDiffrentAmountComponent implements OnInit {

 @Input() symulacja!: Loan[];

 @Input() interestRate: number = 0;
 @Input() margin: number = 0;

  constructor() { }

  ngOnInit() {
  }

}
