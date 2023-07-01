import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private readonly router: Router, private http: HttpClient) {
    this.http.get("https://api.coingecko.com/api/v3/simple/price?ids=iota&vs_currencies=eur")
    .subscribe(res => {
      let tempObject: any = res;
      this._miotaToEur = tempObject.iota.eur;
    })}

  private _accessToken: string = "";
  public get accessToken(): string {
    return this._accessToken;
  }
  public set accessToken(value: string) {
    this._accessToken = value;
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

  private _miotaToEur: number = 0;
  public get miotaToEur(): number {
    return this._miotaToEur;
  }

  public logout() {
    this._loggedIn = false;
    this._accessToken = "";
    this._miota = 100;
    this.router.navigate(["/login"]);
  }
}
