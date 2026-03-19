import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadicalPageComponent } from './radical-page.component';

describe('RadicalPageComponent', () => {
  let component: RadicalPageComponent;
  let fixture: ComponentFixture<RadicalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RadicalPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadicalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
