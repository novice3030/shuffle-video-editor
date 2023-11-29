import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { SourceListComponent } from './source-list/source-list.component';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { VideoSource } from './interfaces/video-source';
import { VideoTrackComponent } from './components/video-track/video-track.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MainLayoutComponent,
    SourceListComponent,
    VideoPreviewComponent,
    VideoTrackComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  @ViewChild('videoPreview', { static: true }) videoPreview!: ElementRef;
  currentPosition = 0;
  userPosition = 0;
  trackPosition = signal(0);
  videoPosition = signal(0);
  trackIndex = signal(0);
  sourceToPlay?: VideoSource;
  trackSources: VideoSource[] = [];
  videoSources: VideoSource[] = [
    {
      name: 'video 1',
      source: '//vjs.zencdn.net/v/oceans.mp4',
      duration: 0,
      width: 0,
      startTime: 0,
      endTime: 0,
      color: '',
    },
    {
      name: 'video 2',
      source: '//d2zihajmogu5jn.cloudfront.net/elephantsdream/ed_hd.mp4',
      duration: 0,
      width: 0,
      startTime: 0,
      endTime: 0,
      color: '',
    },
    {
      name: 'video 3',
      source: 'assets/video-2.mp4',
      duration: 0,
      width: 0,
      startTime: 0,
      endTime: 0,
      color: '',
    },
  ];
  title = 'shuffle-video-editor';

  onListPreviewPlay(source: VideoSource) {
    this.sourceToPlay = source;
  }

  onListPausePreviewClicked(source: VideoSource) {
    this.sourceToPlay = source;
  }

  onTrackItemsChanged(event: VideoSource[]) {
    this.trackSources = event;
  }

  onPreviewPositionChanged(event: number) {
    this.videoPosition.set(event);
    const newPosition = this.calcTrackPosition(
      this.trackIndex(),
      this.videoPosition()
    );
    this.trackPosition.set(newPosition);
  }

  onUserPositionChanged(event: number) {
    this.trackPosition.set(event);
    this.videoPosition.set(
      this.calcVideoPosition(this.trackIndex(), this.trackPosition())
    );
    this.userPosition = event;
  }

  onTrackIndexChanged(event: number) {
    this.trackIndex.set(event);
  }

  onPlayNextTrack() {
    this.trackIndex.update((v) => (v <= this.trackSources.length ? v + 1 : v));
  }

  private calcTrackPosition(
    currentTrackIndex: number,
    currentTime: number
  ): number {
    let totalDuration = 0;
    for (let i = 0; i < currentTrackIndex; i++) {
      totalDuration += this.trackSources[i]?.duration || 0;
    }
    return totalDuration + currentTime;
  }

  private calcVideoPosition(currentTrackIndex: number, trackPosition: number) {
    let prevTime = 0;
    for (let i = 1; i <= currentTrackIndex; i++) {
      prevTime += this.trackSources[i - 1].duration;
    }
    return trackPosition - prevTime;
  }
}
