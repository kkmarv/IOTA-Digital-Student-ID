import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mensa-page',
  templateUrl: './mensa-page.component.html',
  styleUrls: ['./mensa-page.component.css']
})
export class MensaPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  balance: number = 100

}
