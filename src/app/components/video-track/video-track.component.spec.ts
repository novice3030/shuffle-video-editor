import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTrackComponent } from './video-track.component';

describe('VideoTrackComponent', () => {
  let component: VideoTrackComponent;
  let fixture: ComponentFixture<VideoTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoTrackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
