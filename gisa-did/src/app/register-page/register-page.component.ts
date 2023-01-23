import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
})
export class RegisterPageComponent implements OnInit {

  constructor(private http: HttpClient, private data: DataService, private readonly router: Router) { }

  studySubjects: Array<String> = ["Informatik", "Gender Studies", "Japanologie", "Grundschullehramt Tanzunterricht"];
  state: String = "registerKeeper";
  loadingState: String = "Verifiable Presentation von Hochschule überprüfen lassen...";

  ngOnInit(): void {
  }

  submitKeeperLogin(loginData: {username: string, password: string}) {
    //registrieren:
    this.loadingState = "Registrieren...";
    this.state = "loading";
    this.http.put("http://localhost:8081/api/did/create", loginData, {headers:{"Access-Control-Allow-Origin": "*"}})
    .subscribe(res => {
      this.loadingState = "Einloggen...";
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
          this.loadingState = "Challenge anfordern...";
          this.data.did = res.did;
          //challenge mit der did anfordern
          // let did = {
          //   id: "did:iota:dev:FtAZ3Uv4bUhEAwJTkLwb74mxM3L3Qwi47CmDjFBZQAqD"
          // }
          this.http.post("http://localhost:8080/api/challenge", { id: res.did }, {responseType: "text"})
          .subscribe(res => {
            this.loadingState = "Challenge zwischenspeichern...";
            this.data.challenge = res;
            this.state = 'registerUniversity';
          })
        })
      })
    })
  }

  submitUniversityLogin(data: any) {
    //student registrieren
    let personalData = {
      "id": this.data.did,
      "challenge": this.data.challenge,
      "challengeSignature": "todo",
      "studySubject": {
        "degree": "Bachelor of Arts",
        "name": data.studySubject
      },
      "studentData": {
        "firstName": data.firstNames.split(" ")[0],
        "middleNames": data.firstNames.slice(data.firstNames.split(" ").length+1),
        "familyName": data.lastName,
        "birthDate": data.birthday.toLocaleDateString(),
        "photo": "https://thispersondoesnotexist.com/",
        "address": {
          "street": data.adress1,
          "houseNumber": data.adress2,
          "postalCode": data.adress3,
          "city": data.adress4,
          "county": data.adress5,
          "country": data.adress6,
        }
      }
    }
    this.loadingState = "Credential anfordern...";
    this.state = "loading";
    console.warn(personalData);
    this.http.post("http://localhost:8080/api/student/register", personalData)
    .subscribe(res => {
      console.log(res);
      this.data.credential = res;
      this.state = "nameCredential";
    })
  }

  submitCredentialName(credentialName: String) {
      //credential im keeper speichern
      this.data.credentialName = credentialName;
      let body = {
        "credentialName": this.data.credentialName,
        "verifiableCredential": this.data.credential
      }
      this.loadingState = "Autorisieren...";
      this.state = "loading";
      this.http.put("http://localhost:8081/api/credentials/store", body, {headers:{Authorization: ("Bearer " + this.data.keeperToken)}})
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
          console.log(res);
          if(res === "OK") {
            this.data.loggedIn = true;
            this.router.navigate(["/home"]);
            // getElementsByName("body")[0].append("a");
          };
        })
      })
  }


  log(lol: any) {
    console.log(lol);

  }



}
