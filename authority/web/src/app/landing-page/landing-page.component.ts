import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {

  constructor(
    private data: DataService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    if(this.data.loggedIn) this.router.navigate(["/home"]);
  }

}
