import { LoanType } from './type';

export class Loan {

    current: boolean = false;

    monthlyPayment: number = 0;
    odsetkiSuma: number = 0;
    splataRazem: number = 0;
    pierwszaRata: RataMiesieczna | null = null;

    odsetkiSuma10Lat: number = 0;
    kapitalSuma10Lat: number = 0;

    harmonogram: RataMiesieczna[] = [];

    get amountDiff(): number {
        if (this.baseLoan) {
            return this.amount - this.baseLoan.amount;
        }

        return 0;
    }

    get amountDiffPercent(): number {
        if (this.baseLoan) {
            return (this.amount / this.baseLoan.amount) - 1;
        }

        return 0;
    }



    get interestRateDiff(): number {
        if (this.baseLoan) {
            return this.interestRate - this.baseLoan.interestRate;
        }

        return 0;
    }

    get monthlyPaymentDiff(): number {
        if (this.baseLoan) {
            return this.monthlyPayment - this.baseLoan.monthlyPayment;
        }

        return 0;
    }

    get monthlyPaymentDiffPercent(): number {
        if (this.baseLoan) {
            return (this.monthlyPayment / this.baseLoan.monthlyPayment) - 1;
        }

        return 0;
    }

    get odsetkiDiff(): number {
        if (this.baseLoan && this.baseLoan.pierwszaRata && this.pierwszaRata) {
            return this.pierwszaRata.odsetki - this.baseLoan.pierwszaRata.odsetki;
        }

        return 0;
    }

    get odsetkiDiffPercent(): number {

        if (this.baseLoan && this.baseLoan.pierwszaRata && this.pierwszaRata) {
            return (this.pierwszaRata.odsetki / this.baseLoan.pierwszaRata.odsetki) - 1;
        }

        return 0;
    }

    get kapitalDiff(): number {
        if (this.baseLoan && this.baseLoan.pierwszaRata && this.pierwszaRata) {
            return this.pierwszaRata.kapital - this.baseLoan.pierwszaRata.kapital;
        }

        return 0;
    }

    get kapitalDiffPercent(): number {

        if (this.baseLoan && this.baseLoan.pierwszaRata && this.pierwszaRata) {
            return (this.pierwszaRata.kapital / this.baseLoan.pierwszaRata.kapital) - 1;
        }

        return 0;
    }

    get odsetki10Diff(): number {
        if (this.baseLoan) {
            return this.odsetkiSuma10Lat - this.baseLoan.odsetkiSuma10Lat;
        }

        return 0;
    }

    get odsetki10DiffPercent(): number {

        if (this.baseLoan) {
            return (this.odsetkiSuma10Lat / this.baseLoan.odsetkiSuma10Lat) - 1;
        }

        return 0;
    }

    get kapital10Diff(): number {
        if (this.baseLoan) {
            return this.kapitalSuma10Lat - this.baseLoan.kapitalSuma10Lat;
        }

        return 0;
    }

    get kapital10DiffPercent(): number {

        if (this.baseLoan) {
            return (this.kapitalSuma10Lat / this.baseLoan.kapitalSuma10Lat) - 1;
        }

        return 0;
    }

    get odsetkiSumaDiff(): number {
        if (this.baseLoan) {
            return this.odsetkiSuma - this.baseLoan.odsetkiSuma;
        }

        return 0;
    }

    get odsetkiSumaDiffPercent(): number {

        if (this.baseLoan) {
            return (this.odsetkiSuma / this.baseLoan.odsetkiSuma) - 1;
        }

        return 0;
    }

    get splataRazemDiff(): number {
        if (this.baseLoan) {
            return this.splataRazem - this.baseLoan.splataRazem;
        }

        return 0;
    }

    get splataRazemDiffPercent(): number {

        if (this.baseLoan) {
            return (this.splataRazem / this.baseLoan.splataRazem) - 1;
        }

        return 0;
    }

    //http://www.drewslair.com/wp-content/uploads/2018/04/Mortgage.jpg

    constructor(public loanType: LoanType, public amount: number, public months: number, public interestRate: number, private baseLoan: Loan | null = null, private skipHarmonogram = false) {
        this.recalculate();
    }

    //r
    get monthlyInterest(): number {
        return (this.interestRate * 0.01) / 12;
    }

    recalculate() {
        this.harmonogram = [];

        if (this.loanType == LoanType.Constant) {
            const top = this.monthlyInterest * Math.pow(1 + this.monthlyInterest, this.months);
            const bottom = Math.pow(1 + this.monthlyInterest, this.months) - 1;
            this.monthlyPayment = +(this.amount * (top / bottom));

            let pozostalaKwota = this.amount;
            let rata = null;

            for (let i = 1; i <= this.months; i++) {

                if (i == 1 || !this.skipHarmonogram) {
                    if (rata) {
                        pozostalaKwota = rata.kwotaKredytuPozostala;
                    }

                    rata = new RataMiesieczna();
                    rata.obliczRataStala(i, pozostalaKwota, this.interestRate, this.monthlyPayment);
                    this.harmonogram.push(rata);
                }
            }
        }
        else if (this.loanType == LoanType.Decreasing) {
            const kapital = this.amount / this.months;
            const secondPart = 1 + (this.months - 1 + 1) * this.monthlyInterest
            this.monthlyPayment = kapital * secondPart;


            let pozostalaKwota = this.amount;
            let rata = null;

            for (let i = 1; i <= this.months; i++) {
                if (i == 1 || !this.skipHarmonogram) {
                    
                    if (rata) {
                        pozostalaKwota = rata.kwotaKredytuPozostala;
                    }

                    rata = new RataMiesieczna();
                    rata.obliczRataMalejaca(i, this.amount, this.months, this.interestRate, pozostalaKwota);

                    this.harmonogram.push(rata);
                }
            }
        }

        this.pierwszaRata = this.harmonogram[0];
        
        if(!this.skipHarmonogram)
        {
            this.odsetkiSuma = this.harmonogram.map(o => o.odsetki).reduce((a, c) => a + c);
            this.splataRazem = this.odsetkiSuma + this.amount;
            
            const pierwsze10lat = this.harmonogram.slice(0, 10 * 12);
            this.odsetkiSuma10Lat = pierwsze10lat.map(o => o.odsetki).reduce((a, c) => a + c);
            this.kapitalSuma10Lat = pierwsze10lat.map(o => o.kapital).reduce((a, c) => a + c);
        }
    }
}


export class RataMiesieczna {

    numerMiesiaca: number = 0;
    odsetki: number = 0;
    kapital: number = 0;
    kwotaKredytu: number = 0;
    kwotaKredytuPozostala: number = 0;
    rataKredytu: number = 0

    get kapitalPercent(): number {
        let value = this.kapitalPercentReal;

        if (value < 10) {
            value = 10;
        }
        else if (value > 90) {
            value = 90;
        }

        return value;
    }

    get kapitalPercentReal(): number {
        let value = +((this.kapital / this.rataKredytu) * 100).toFixed(2);
        return value;
    }

    get odsetkiPercent(): number {
        return 100 - this.kapitalPercent;
    }

    get odsetkiPercentReal(): number {
        return 100 - this.kapitalPercentReal;
    }

    obliczRataStala(numerMiesiaca: number, pozostalaKwota: number, oprocentowanie: number, rataKredytu: number) {
        this.numerMiesiaca = numerMiesiaca;
        this.kwotaKredytu = pozostalaKwota;
        this.odsetki = pozostalaKwota * (oprocentowanie * 0.01 / 12);
        this.kapital = rataKredytu - this.odsetki;
        this.kwotaKredytuPozostala = pozostalaKwota - this.kapital;
        this.rataKredytu = rataKredytu;
    }

    obliczRataMalejaca(numerMiesiaca: number, kwotaKredytu: number, iloscMiesiecy: number, oprocentowanie: number, pozostalaKwota: number) {
        this.numerMiesiaca = numerMiesiaca;
        this.kapital = kwotaKredytu / iloscMiesiecy;
        this.kwotaKredytu = kwotaKredytu;
        const secondPart = 1 + (iloscMiesiecy - numerMiesiaca + 1) * (oprocentowanie * 0.01 / 12)
        this.rataKredytu = this.kapital * secondPart;
        this.odsetki = this.rataKredytu - this.kapital;
        this.kwotaKredytuPozostala = pozostalaKwota - this.kapital;
    }
}