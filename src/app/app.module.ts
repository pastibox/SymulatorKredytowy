import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { MatSliderModule } from '@angular/material/slider';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import localePL from '@angular/common/locales/pl';
import { registerLocaleData } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { HarmonogramComponent } from './components/harmonogram/harmonogram.component';
import { SimulationComponent } from './components/simulation/simulation.component';
import { SimulationLoanAmountComponent } from './components/simulation-loan-amount/simulation-loan-amount.component';
registerLocaleData(localePL);

@NgModule({
  declarations: [
    AppComponent,
    HarmonogramComponent,
    SimulationComponent,
    SimulationLoanAmountComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSliderModule,
    FormsModule,
    MatTableModule,
    MatTabsModule
  ],
  providers: [{provide: LOCALE_ID, useValue: 'pl' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
