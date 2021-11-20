import { Component, Input } from '@angular/core';
import { Loan } from 'src/app/model/loan';

@Component({
  selector: 'app-harmonogram',
  templateUrl: './harmonogram.component.html',
  styleUrls: ['./harmonogram.component.css']
})
export class HarmonogramComponent {

  @Input() loan!: Loan;

  displayedColumns: string[] = ['miesiac', 'kwota', 'rata', 'kapital' , 'odsetki'];

}
