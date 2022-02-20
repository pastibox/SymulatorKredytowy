import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class HelperService {

    constructor() { }

    isValidInt(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode >= 48 && charCode <= 57) {
            return true
        }

        return false;
    }
}


