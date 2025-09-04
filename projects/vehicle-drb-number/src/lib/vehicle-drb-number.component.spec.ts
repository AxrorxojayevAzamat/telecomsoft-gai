import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleDrbNumberComponent } from './vehicle-drb-number.component';

describe('VehicleDrbNumberComponent', () => {
  let component: VehicleDrbNumberComponent;
  let fixture: ComponentFixture<VehicleDrbNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleDrbNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleDrbNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
