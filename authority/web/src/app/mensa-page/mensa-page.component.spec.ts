import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensaPageComponent } from './mensa-page.component';

describe('MensaPageComponent', () => {
  let component: MensaPageComponent;
  let fixture: ComponentFixture<MensaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MensaPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MensaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
