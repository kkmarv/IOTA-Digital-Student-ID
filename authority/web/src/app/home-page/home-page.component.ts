import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor(private http: HttpClient, private data: DataService, private readonly router: Router) { }

  loggedIn = this.data.loggedIn;

  ngOnInit(): void {
    if(!this.data.loggedIn) this.router.navigate(["/"]);
  }

  logout() {
    this.data.logout();
  }

  apiTest() {
    // window.open('http://localhost:8081/landing?authority=http://8080/api&program=Computer Science', '_blank')?.focus();



    // registrieren:
    // let login = {
    //   "username": "abcde",
    //   "password": "okokok"
    // }
    //   this.http.put("http://localhost:8081/api/did/create", login, {headers:{"Access-Control-Allow-Origin": "*"},observe:'response'})
    //   .subscribe(res => {
    //     console.log(res.status)
    //   }, error => {
    //     console.log(error.status);
    //     console.log(error.statusText);
    //     console.log(error.error);
    //     console.log("lol");
    //   })
    
    //einloggen:
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMjM0IiwiaWF0IjoxNjc0MTUzOTcxLCJleHAiOjE2NzQ3NTg3NzF9.VmTsi8Mo6JHciceIDSI8NPfLqJnGu1VxCMAUa_wiIcI
    // let login = {
    //   "username": "testuser234",
    //   "password": "okokok"
    // }
    // this.http.post("http://localhost:8081/api/did/login", login, {observe:'response'})
    // .subscribe(res => {
    //   console.log(res)
    // })


    //did getten mit dem token von vorher
    // let password = {
    //   password: "okokok"
    // }
    // this.http.post("http://localhost:8081/api/did/get", password, {headers:{Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMjM0IiwiaWF0IjoxNjc4MTIyMzA3LCJleHAiOjE2Nzg3MjcxMDd9.0maJmBkZwgMxnHXlaYXt2A6QxvEVtPzaq_WGsdbZG_E"},observe:'response'})
    // .subscribe(res => {
    //   console.log(res)
    // })

    //challenge mit der did anfordern
    //a5c274b074a2bcc0563edbffef32b63c4b0123d5fac39184badf56b423478b4c
    // let did = {
    //   id: "did:iota:dev:FtAZ3Uv4bUhEAwJTkLwb74mxM3L3Qwi47CmDjFBZQAqD"
    // }
    // this.http.post("http://localhost:8080/api/challenge", did, {responseType: "text"})
    // .subscribe(res => console.log(res))

    //student registrieren
    // let credential;
    // let personalData = {
    //   "id": "did:iota:dev:FtAZ3Uv4bUhEAwJTkLwb74mxM3L3Qwi47CmDjFBZQAqD",
    //   "challenge": "todo",
    //   "challengeSignature": "todo",
    //   "studySubject": {
    //     "degree": "Bachelor of Arts",
    //     "name": "Gender Studies"
    //   },
    //   "studentData": {
    //     "firstName": "Dustin",
    //     "middleNames": "Walter Bruno",
    //     "familyName": "Henke",
    //     "birthDate": "09.07.2000",
    //     "photo": "https://thispersondoesnotexist.com/",
    //     "address": {
    //       "street": "Musterweg",
    //       "houseNumber": 123,
    //       "postalCode": 123456,
    //       "city": "Musterstetten",
    //       "county": "Bavaria",
    //       "country": "Germany"
    //     }
    //   }
    // }
    // this.http.post("http://localhost:8080/api/student/register", personalData)
    // .subscribe(res => {
    //   console.log(res);
    //   credential = res;
    //   //credential im keeper speichern
    //   let body = {
    //     "credentialName": "einzigartigerName",
    //     "verifiableCredential": credential
    //   }
    //   this.http.put("http://localhost:8081/api/credentials/store", body, {headers:{Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMjM0IiwiaWF0IjoxNjc0MTUzOTcxLCJleHAiOjE2NzQ3NTg3NzF9.VmTsi8Mo6JHciceIDSI8NPfLqJnGu1VxCMAUa_wiIcI"}})
    //   .subscribe(res => {
    //     console.log(res);
    //   })
    // })

    //Verifiable Presentation erstellen (login)
    // let body = {
    //   "password": "okokok",
    //   "challenge": "a5c274b074a2bcc0563edbffef32b63c4b0123d5fac39184badf56b423478b4c",
    //   "credentialName": [
    //     "einzigartigerName"
    //   ]
    // }
    // this.http.post("http://localhost:8081/api/presentations/create", body, {headers:{Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyMjM0IiwiaWF0IjoxNjc0MTUzOTcxLCJleHAiOjE2NzQ3NTg3NzF9.VmTsi8Mo6JHciceIDSI8NPfLqJnGu1VxCMAUa_wiIcI"}})
    //   .subscribe(res => {
    //     console.log(res);
    //     //presentation an uni schicken
    //     this.http.post("http://localhost:8080/api/student/login", res, {responseType: "text"})
    //     .subscribe(res => {
    //       console.log(res)
    //     })
    //   })
  }

}
