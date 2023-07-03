import { Component, OnInit } from '@angular/core'
import { DataService } from '../data.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-mensa-page',
  templateUrl: './mensa-page.component.html',
  styleUrls: ['./mensa-page.component.css'],
})
export class MensaPageComponent implements OnInit {
  constructor(private data: DataService, private readonly router: Router) {}

  ngOnInit(): void {
    if (!this.data.loggedIn) this.router.navigate(['/login'])
  }

  state: String = 'menu'
  loadingState: String = 'Loading...'

  balance = this.data.miota

  buy(price: number) {
    if (this.data.miota >= price) {
      this.loadingState = 'Bezahlung wird durchgeführt...'
      this.state = 'loading'
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
      sleep(Math.floor(Math.random() * 2000 + 5000)).then((res) => {
        this.data.miota = this.data.miota - price
        this.balance = this.data.miota
        this.state = 'purchaseSuccess'
        sleep(2000).then((res) => (this.state = 'menu'))
      })
    } else console.error('Nicht genügend IOTA!')
  }

  getRoundedEurPrice(miota: number) {
    return Math.floor(miota * this.data.miotaToEur * 100) / 100
  }
}
