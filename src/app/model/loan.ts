export class Loan {

    monthlyPayment:number = 0;
    odsetkiSuma:number = 0;
    splataRazem:number = 0;
    pierwszaRata:RataMiesieczna | null = null;

    odsetkiSuma10Lat:number = 0;
    kapitalSuma10Lat:number = 0;

    harmonogram: RataMiesieczna[] = [];

    //http://www.drewslair.com/wp-content/uploads/2018/04/Mortgage.jpg

    constructor(public amount: number, public months:number, public interestRate:number) {
        this.recalculate();
    }

    //r
    get monthlyInterest(): number {
        return (this.interestRate * 0.01)/12;
    }

    recalculate()
    {
        const top = this.monthlyInterest * Math.pow(1+ this.monthlyInterest, this.months);
        const bottom = Math.pow(1+ this.monthlyInterest, this.months) - 1;
        this.monthlyPayment = +(this.amount * (top/bottom));


        this.harmonogram = [];

        let pozostalaKwota = this.amount;
        let rata = null;

        for (let i = 1; i <= this.months; i++) {

            if(rata)
            {
                pozostalaKwota = rata.kwotaKredytuPozostala;
            }

            rata = new RataMiesieczna(i, pozostalaKwota, this.interestRate, this.monthlyPayment);
            this.harmonogram.push(rata);
        }

        this.odsetkiSuma = this.harmonogram.map(o=> o.odsetki).reduce((a,c)=>a + c);
        this.splataRazem = this.odsetkiSuma + this.amount;
        this.pierwszaRata = this.harmonogram[0];


        const pierwsze10lat = this.harmonogram.slice(0, 10*12);
        this.odsetkiSuma10Lat = pierwsze10lat.map(o=> o.odsetki).reduce((a,c)=>a + c);
        this.kapitalSuma10Lat = pierwsze10lat.map(o=> o.kapital).reduce((a,c)=>a + c);

    }
}


export class RataMiesieczna {

        odsetki:number = 0;
        kapital:number = 0;
        kwotaKredytu :number = 0;
        kwotaKredytuPozostala :number = 0;
        rataKredytu:number = 0
        
        constructor(public numerMiesiaca:number, pozostalaKwota: number, oprocentowanie:number, rataKredytu:number) {
            
           this.kwotaKredytu = pozostalaKwota;
           this.odsetki = pozostalaKwota * (oprocentowanie * 0.01 / 12);
           this.kapital = rataKredytu - this.odsetki;
           this.kwotaKredytuPozostala = pozostalaKwota - this.kapital;
           this.rataKredytu = rataKredytu;
        }
}