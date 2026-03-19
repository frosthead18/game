import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleArmourPageComponent } from './battle-armour-page.component';

describe('BattleArmourPageComponent', () => {
  let component: BattleArmourPageComponent;
  let fixture: ComponentFixture<BattleArmourPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BattleArmourPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BattleArmourPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
