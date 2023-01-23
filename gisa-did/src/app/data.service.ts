import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private readonly router: Router) { }

  private _username: string = "";
  public get username(): string {
    return this._username;
  }
  public set username(value: string) {
    this._username = value;
  }

  private _keeperToken: string = "";
  public get keeperToken(): string {
    return this._keeperToken;
  }
  public set keeperToken(value: string) {
    this._keeperToken = value;
  }

  private _did: String = "";
  public get did(): String {
    return this._did;
  }
  public set did(value: String) {
    this._did = value;
  }

  private _challenge: String = "";
  public get challenge(): String {
    return this._challenge;
  }
  public set challenge(value: String) {
    this._challenge = value;
  }

  private _credential: any;
  public get credential(): any {
    return this._credential;
  }
  public set credential(value: any) {
    this._credential = value;
  }

  private _credentialName: String = "";
  public get credentialName(): String {
    return this._credentialName;
  }
  public set credentialName(value: String) {
    this._credentialName = value;
  }

  private _loggedIn: Boolean = false;
  public get loggedIn(): Boolean {
    return this._loggedIn;
  }
  public set loggedIn(value: Boolean) {
    this._loggedIn = value;
  }

  private _miota: number = 100;
  public get miota(): number {
    return this._miota;
  }
  public set miota(value: number) {
    this._miota = value;
  }

  public logout() {
    this._loggedIn = false;
    this._username = "";
    this._keeperToken = "";
    this._did = "";
    this._challenge = "";
    this._credential = "";
    this._miota = 100;
    this.router.navigate(["/login"]);
  }


}
