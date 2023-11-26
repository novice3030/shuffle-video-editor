import {
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
import Player from 'video.js/dist/types/player';
import videojs from 'video.js';
import { VideoTrackComponent } from './components/video-track/video-track.component';
import { UserPositionEvent } from './interfaces/user-position-event';

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
  trackIndex = 0;
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
    this.currentPosition = event;
  }

  onUserPositionChanged(event: UserPositionEvent) {
    this.userPosition = event.position;
    this.trackIndex = event.trackIndex;
  }
}
