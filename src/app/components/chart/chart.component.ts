import { Component, Input, OnInit } from '@angular/core';

import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexDataLabels,
    ApexTooltip,
    ApexStroke
} from "ng-apexcharts";
import { Loan } from 'src/app/model/loan';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
};

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.css']
})
export class LoanChartComponent implements OnInit {
    private _loan!: Loan

    @Input()
    set loan(value: Loan) {
        debugger;
        this._loan = value;
        this.RenderChart();
    }


    public chartOptions: Partial<ChartOptions> | any;

    constructor() {
    }

    ngOnInit() {


    }

    private RenderChart() {
        this.chartOptions = {
            series: [
                {
                    name: "odsetki",
                    data: this._loan.harmonogram.map(x => [x.numerMiesiaca, x.odsetki.toFixed(2)])
                },
                {
                    name: "kapitał",
                    data: this._loan.harmonogram.map(x => [x.numerMiesiaca, x.kapital.toFixed(2)])
                }
            ],
            chart: {
                //height: 350,
                type: "area",
                stacked: true,
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth",
                width: 1
            },
            xaxis: {
                type: "numeric",
                tickPlacement: 'between'
            },
            yaxis: {

            },
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 0.1,
                    opacityFrom: 0.9,
                    opacityTo: 0.9,
                    stops: [100, 100]
                }
            },
            tooltip: {

            },
            colors: ['#dc3545', '#14ac00']
        };
    }

}
