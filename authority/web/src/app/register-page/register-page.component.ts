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
  errorMessage: String = "";
  state: String = "registerStudySubject";
  loadingState: String = "Verifiable Presentation von Hochschule überprüfen lassen...";

  ngOnInit(): void {
    if(this.data.loggedIn) this.router.navigate(["/home"]);
  }
  
  registerStudySubject(subject: String) {
    window.open('http://localhost:5173/landing?authority=http://localhost:8080/api/credential/student/issue&wants=NationalIDCredential&program=' + subject, '_self');
  }
}
