import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import 'videojs-playlist';
import { VideoSource } from '../interfaces/video-source';
import Player from 'video.js/dist/types/player';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../services/state.service';

@Component({
  selector: 'video-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './video-preview.component.html',
  styleUrl: './video-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPreviewComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  constructor(
    private cdr: ChangeDetectorRef,
    private stateService: StateService
  ) {}

  @ViewChild('videoPreview', { static: true }) videoPreview!: ElementRef;
  @Input() source?: VideoSource;
  @Input() trackSources: VideoSource[] = [];
  @Input() pause = false;
  @Output() positionChanged = new EventEmitter<number>();
  @Input() position = 0;
  @Input() userPosition = 0;
  @Input() trackIndex = 0;
  @Output() trackIndexChanged = new EventEmitter<number>();
  private player!: Player;
  private prevUserPosition = 0;
  state: 'play' | 'pause' = 'pause';

  ngAfterViewInit(): void {
    this.player = videojs(this.videoPreview.nativeElement, {
      controls: false,
      fluid: true,
      aspectRatio: '8:3',
    });
    this.stateService.userPositionChanged$.subscribe((change) => {
      this.prevUserPosition = change.position;
      this.player.currentTime(change.position);
    });
    this.player.on('ended', () => {
      this.prevUserPosition = 0;
      if (this.trackIndex < this.trackSources.length - 1) {
        this.trackIndexChanged.emit();
      } else {
        this.state = 'pause';
        this.cdr.markForCheck();
      }
    });
    this.player.on('loadedmetadata', () => {
      this.player.currentTime(this.prevUserPosition);
    });
    this.player.on('timeupdate', () => {
      const currentTime = this.player.currentTime() || 0;
      if (this.state === 'play') {
        this.positionChanged.emit(currentTime);
      }
    });
    this.player.on('play', () => {
      this.player.currentTime(this.position);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.player && this.source) {
      if (this.player.currentSrc() !== this.source.source) {
        this.player.src(this.source.source);
        this.player.load();
        if (this.state === 'play') {
          this.player.play();
        }
      } else {
        if (!this.source.isPlaying) {
          this.player.pause();
        } else {
          this.player.play();
        }
      }
    }
    if (this.player) {
      if (
        changes['trackIndex']?.currentValue !==
        changes['trackIndex']?.previousValue
      ) {
        this.player.src(this.trackSources[this.trackIndex].source);
        this.player.load();
        if (this.state === 'play') {
          this.player.play();
        }
      }
    }
  }

  onPlayClicked() {
    this.state = 'play';
    this.cdr.markForCheck();
    this.playTrack(this.trackIndex);
  }

  onPauseClicked() {
    this.state = 'pause';
    this.player.pause();
    this.cdr.markForCheck();
  }

  private calcVideoPosition(currentTrackIndex: number, trackPosition: number) {
    let prevTime = 0;
    for (let i = 1; i <= currentTrackIndex; i++) {
      prevTime = this.trackSources[i - 1].duration;
    }
    return trackPosition - prevTime;
  }

  private calcPosition(currentTrackIndex: number, currentTime: number): number {
    let totalDuration = 0;
    for (let i = 0; i < currentTrackIndex; i++) {
      totalDuration += this.trackSources[i]?.duration || 0;
    }
    return totalDuration + currentTime;
  }

  private playTrack(index: number) {
    if (
      (this.player.src(undefined) || '') !== this.trackSources[index].source
    ) {
      this.player.src(this.trackSources[index].source);
      this.player.load();
    }
    this.player.play();
  }

  ngOnDestroy(): void {
    this.player.dispose();
  }
}
