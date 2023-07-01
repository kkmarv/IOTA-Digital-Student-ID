import { Component, OnInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private data: DataService,
    private readonly router: Router
  ) { }
  ngOnInit(): void {
    if(this.data.loggedIn) this.router.navigate(["/home"]);
    else if(this.router.url.length > "/login/".length) {
      let accessToken = this.router.url.replace("/login?token=", "");
      fetch("http://localhost:8080/api/auth/token/verify", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      }).then(res => {
        if(res.ok) {
          this.data.accessToken = accessToken;
          this.data.loggedIn = true;
          this.router.navigate(["/home"]);
        } else res.json().then(res => console.log(res));
      })
      // console.log(token);
    } else this.state = "login";
  }

  state: "login" | "loading" = "loading";
  loadingState: String = "Loading...";

  credentials: String[] = [];
  credentialName: String = "";
  
  login() {
    window.open("http://localhost:5173/landing?authority=http://localhost:8080/api/auth/token/create&wants=StudentIDCredential", "_self");
  }
}
