import { Component, Input, OnInit } from '@angular/core';
import { Loan } from 'src/app/model/loan';
import { HelperService } from 'src/app/services/helper.service';

@Component({
    selector: 'app-rent-simulation',
    templateUrl: './rent-simulation.component.html',
    styleUrls: ['./rent-simulation.component.css']
})
export class RentSimulationComponent implements OnInit {

    @Input() loan!: Loan;
    rentAmountMax: number = 10000;
    rentAmountMin: number = 0;
    rentAmount: number = 0;
    costsAmountMax: number = 2000;
    costsAmountMin: number = 0;
    costsAmount: number = 0;

    symulacjaAktualnyMiesiac: number = 1;

    get symulacjaAktualnyRok(): number {
        return Math.ceil(this.symulacjaAktualnyMiesiac / 12);
    }

    get symulacjaZaplaconeOdsetki(): number {
        const since1toCurrent = this.loan.harmonogram.slice(0, this.symulacjaAktualnyMiesiac);
        return since1toCurrent.map(o => o.odsetki).reduce((a, c) => a + c);
    }

    get symulacjaZaplaconeKoszty(): number {
        return this.costsAmount * this.symulacjaAktualnyMiesiac;
    }

    get sumaKosztowKredytu(): number {
        return this.symulacjaZaplaconeOdsetki + this.symulacjaZaplaconeKoszty;
    }

    get symulacjaZaplaconeNajem(): number {
        return this.rentAmount * this.symulacjaAktualnyMiesiac;
    }


    get isRentBetter(): boolean {
        return (this.symulacjaZaplaconeNajem - this.sumaKosztowKredytu) <= 0;
    }

    constructor(private helperService: HelperService) { }

    ngOnInit() {
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

    isValidInt(event: any): boolean {
        return this.helperService.isValidInt(event);
    }

    changeAmount(changedAmount: number): void {
        this.rentAmount = this.rentAmount + changedAmount;

        if (this.rentAmount < this.rentAmountMin) {
            this.rentAmount = this.rentAmountMin;
        }

        if (this.rentAmount > this.rentAmountMax) {
            this.rentAmount = this.rentAmountMax;
        }
    }

    changeAmountInput(val: any) {
        let changedValue = +(val.target.value.replace(/\s/g, ''));

        if (!Number.isNaN(changedValue)) {
            if (changedValue >= this.rentAmountMin && changedValue <= this.rentAmountMax) {
                this.rentAmount = changedValue;
            }
            else if (changedValue < this.rentAmountMin) {
                this.rentAmount = this.rentAmountMin;
            }
            else if (changedValue > this.rentAmountMax) {
                this.rentAmount = this.rentAmountMax;
            }
        }

        val.target.value = this.rentAmount;
    }

    changeCosts(changedAmount: number): void {
        this.costsAmount = this.costsAmount + changedAmount;

        if (this.costsAmount < this.costsAmountMin) {
            this.costsAmount = this.costsAmountMin;
        }

        if (this.costsAmount > this.costsAmountMax) {
            this.costsAmount = this.costsAmountMax;
        }
    }

    changeCostsInput(val: any) {
        let changedValue = +(val.target.value.replace(/\s/g, ''));

        if (!Number.isNaN(changedValue)) {
            if (changedValue >= this.costsAmountMin && changedValue <= this.costsAmountMax) {
                this.costsAmount = changedValue;
            }
            else if (changedValue < this.costsAmountMin) {
                this.costsAmount = this.costsAmountMin;
            }
            else if (changedValue > this.costsAmountMax) {
                this.costsAmount = this.costsAmountMax;
            }
        }

        val.target.value = this.costsAmount;
    }

}
