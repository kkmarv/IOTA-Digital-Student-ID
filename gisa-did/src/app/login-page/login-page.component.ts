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

  constructor(private http: HttpClient, private data: DataService, private readonly router: Router) { }
  ngOnInit(): void {
    if(this.data.loggedIn) this.router.navigate(["/home"]);
  }

  state: String = "loginKeeper";
  loadingState: String = "Loading...";

  credentials: String[] = [];
  credentialName: String = "";
  
  submitKeeperLogin(loginData: {username: string, password: string}) {
    this.loadingState = "Bei DID-Speicher einloggen...";
    this.state = "loading";
    // einloggen:
    this.http.post("http://localhost:8081/api/did/login", loginData)
    .subscribe(res => {
      this.data.username = loginData.username;
      let tempToken: any;
      tempToken = res;
      if(tempToken.hasOwnProperty('jwt')) {
        this.data.keeperToken = tempToken.jwt;
      } else console.error("property jwt konnte nicht gefunden werden: ", tempToken);
      this.loadingState = "DID anfordern...";
      this.http.post("http://localhost:8081/api/did/get", { password: loginData.password }, {headers:{Authorization: ("Bearer " + this.data.keeperToken)}})
      .subscribe((res: any) => {
        this.data.did = res.did;
        this.loadingState = "Challenge anfordern...";
        //challenge mit der did anfordern
        // let did = {
        //   id: "did:iota:dev:FtAZ3Uv4bUhEAwJTkLwb74mxM3L3Qwi47CmDjFBZQAqD"
        // }
        this.http.post("http://localhost:8080/api/challenge", { id: res.did }, {responseType: "text"})
        .subscribe(res => {
          this.loadingState = "Challenge zwischenspeichern...";
          this.data.challenge = res;
          this.loadingState = "Liste aller gespeicherten Credentials anfordern...";
          this.http.get("http://localhost:8081/api/credentials/list", {headers:{Authorization: ("Bearer " + this.data.keeperToken)}})
          .subscribe( res => {
            let tempRes: any = res;
            if(tempRes.hasOwnProperty('credentials')) this.credentials = tempRes.credentials;
            this.state = 'chooseCredential';
          })
          // this.data.loggedIn = true;
        })
      })
    })
  }

  submitCredential(credential: String) {
    this.data.credentialName = credential;
    this.loadingState = "Credential anfordern...";
    this.state = 'loading';
    this.http.get(("http://localhost:8081/api/credentials/get/" + credential), {headers:{Authorization: ("Bearer " + this.data.keeperToken)}})
    .subscribe(res => {
      this.state = "passwordForPresentation";
    })
  }

  submitPasswordForLogin(password: String) {
    let body = {
      "password": password,
      "challenge": this.data.challenge,
      "credentialName": [
        this.data.credentialName
      ]
    }
    this.loadingState = "Verifiable Presentation anfordern...";
    this.state = "loading";
    this.http.post("http://localhost:8081/api/presentations/create", body, {headers:{Authorization: ("Bearer " + this.data.keeperToken)}})
      .subscribe(res => {
        this.loadingState = "Verifiable Presentation von Hochschule überprüfen lassen...";
        this.state = "loading";
        //presentation an uni schicken
        this.http.post("http://localhost:8080/api/student/login", res, {responseType: "text"})
        .subscribe(res => {
          if(res === "OK") {
            this.data.loggedIn = true;
            this.router.navigate(["/home"]);
            // getElementsByName("body")[0].append("a");
          };
        })
      })
  }

  log(inputEvent: any) {
    console.log(inputEvent);
  }
}
