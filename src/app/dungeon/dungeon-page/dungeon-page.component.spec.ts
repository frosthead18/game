import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DungeonPageComponent } from './dungeon-page.component';

describe('DungeonPageComponent', () => {
  let component: DungeonPageComponent;
  let fixture: ComponentFixture<DungeonPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DungeonPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DungeonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
