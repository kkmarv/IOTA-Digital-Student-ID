import { Component, OnInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Account, AccountBuilder, AutoSave, Network, Presentation, Credential, Timestamp, Duration, ProofOptions, init } from '@iota/identity-wasm/web/identity_wasm.js';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  constructor(private http: HttpClient) { }

  account?: Account;

  ngOnInit(): void {
    init('../../assets/identity_wasm_bg.wasm')
    .then(() => {
      const builder = new AccountBuilder({
        autopublish: false,
        clientConfig: {
          network: Network.devnet()
        }
      });
      builder.createIdentity({
        // privateKey: new Uint8Array([32])
      }).then(res => this.account = res)
      .then(() => console.log(this.account))
    });
  }

  file: any;

  changeFile(e: any) {
    this.file = e.target.files[0];
  }

  uploadFile() {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
        let vp = new Presentation({
          verifiableCredential: Credential.fromJSON(fileReader.result),
          holder: this.account!.did()
          });
          this.http.post("http://localhost:8080/api/challenge", {id: this.account!.did()}, {
            headers: { "Access-Control-Allow-Origin": "http://localhost:4200" }
          })
          .subscribe(res => {
            console.log("lol");
            console.log(res);
            const proof = new ProofOptions({
              challenge: res.toString(),
              expires: Timestamp.nowUTC().checkedAdd(Duration.minutes(10))
            });
            const signedVP = this.account!.createSignedPresentation("sign-0", vp, proof)
            .then(signedVP => {
              this.http.post("http://localhost:8080/api/login", signedVP.toJSON(), {
                headers: { "Access-Control-Allow-Origin": "http://localhost:4200" }
              })
              .subscribe(res => {
                console.log(res);
              });
            });
          })
    }
    fileReader.readAsText(this.file);
  }
  log(inputEvent: any) {
    let file: File = inputEvent.target.files[0]
    console.log(file);
    let fileReader = new FileReader();
    fileReader.onload?(() => {
      console.log(fileReader.result);
      // console.error("lol");
    }):
    fileReader.readAsText(file);
    console.log(fileReader.result);
  }
}
