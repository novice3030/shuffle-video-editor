import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { SourceListComponent } from './source-list/source-list.component';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { VideoSource } from './interfaces/video-source';
import { VideoTrackComponent } from './components/video-track/video-track.component';
import { StateService } from './services/state.service';
import { TrackSettingsComponent } from './components/track-settings/track-settings.component';
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
    TrackSettingsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private state: StateService) {}
  @ViewChild('videoPreview', { static: true }) videoPreview!: ElementRef;
  userPosition = 0;
  trackPosition = this.state.trackPosition;
  videoPosition = this.state.videoPosition;
  trackIndex = this.state.trackIndex;
  playerState = this.state.playerState;
  selectedTrack = this.state.selectedTrack;
  sourceToPlay?: VideoSource;
  trackSources = this.state.trackSources;
  totalTrackDuration = this.state.totalTrackDuration;
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
    this.trackSources.set([...event]);
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
    this.trackIndex.update((v) => v + 1);
  }

  onPlayClicked() {
    this.playerState.set('play');
  }

  onPauseClicked() {
    this.playerState.set('pause');
  }

  onDeleteTrackClicked(trackIndex: number) {
    if (
      trackIndex ===
      this.trackSources().findIndex((track) => track === this.selectedTrack())
    ) {
      this.selectedTrack.set(undefined);
    }
    this.trackSources.set(
      this.trackSources().filter((source, index) => index !== trackIndex)
    );
    if (this.trackPosition() > this.totalTrackDuration()) {
      this.trackPosition.set(0);
    }
  }

  onTrackItemClicked(event: VideoSource) {
    this.selectedTrack.set(event);
  }

  onTrackSettingsChanged(event: VideoSource) {
    const trackIndex = this.trackSources().findIndex(
      (track) => track === event
    );
    this.trackSources.set(
      this.trackSources().map((source, index) =>
        index === trackIndex ? event : source
      )
    );
  }

  private calcTrackPosition(
    currentTrackIndex: number,
    currentTime: number
  ): number {
    let totalDuration = 0;
    for (let i = 0; i < currentTrackIndex; i++) {
      totalDuration += this.trackSources()[i]?.duration || 0;
    }
    return totalDuration + currentTime;
  }

  private calcVideoPosition(currentTrackIndex: number, trackPosition: number) {
    let prevTime = 0;
    for (let i = 1; i <= currentTrackIndex; i++) {
      prevTime += this.trackSources()[i - 1].duration;
    }
    return trackPosition - prevTime;
  }
}
