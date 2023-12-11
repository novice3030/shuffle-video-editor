import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackSettingsComponent } from './track-settings.component';

describe('TrackSettingsComponent', () => {
  let component: TrackSettingsComponent;
  let fixture: ComponentFixture<TrackSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
