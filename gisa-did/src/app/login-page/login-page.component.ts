import { Component, OnInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  file: any;

  changeFile(e: any) {
    this.file = e.target.files[0];
  }

  uploadFile() {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      console.log(fileReader.result);
      this.http.post("localhost:8080", fileReader.result?.toString);
    }
    fileReader.readAsText(this.file);
  }

  log(inputEvent: any) {
    let file: File = inputEvent.target.files[0]
    console.log(file);
    let fileReader = new FileReader();
    fileReader.onload?(() => {
      console.log(fileReader.result);
      console.error("lol");
    }):
    fileReader.readAsText(file);
    console.log(fileReader.result);
  }
}
