import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanesPageComponent } from './planes-page.component';

describe('PlanesPageComponent', () => {
  let component: PlanesPageComponent;
  let fixture: ComponentFixture<PlanesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanesPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
