import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent implements OnInit {

  constructor() { }

  studySubjects: any = ["Informatik", "Gender Studies", "Japanologie", "Grundschullehramt Tanzunterricht"]

  ngOnInit(): void {
  }

  log(lol: any) {
    console.log(lol);
  }



}
