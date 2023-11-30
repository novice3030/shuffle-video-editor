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
import { playerState } from '../interfaces/player-state';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'video-preview',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
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
  @Input() trackIndex = 0;
  @Output() nextTrackIndex = new EventEmitter<number>();
  @Output() playClicked = new EventEmitter();
  @Output() stopClicked = new EventEmitter();
  @Output() puaseClicked = new EventEmitter();
  @Output() playerStateChanged = new EventEmitter<playerState>();
  @Input() playerState: playerState = 'stop';
  private player!: Player;
  private prevUserPosition = 0;

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
        this.nextTrackIndex.emit();
      } else {
        this.player.pause();
        this.playerStateChanged.emit('pause');
      }
    });
    this.player.on('loadedmetadata', () => {
      this.player.currentTime(this.prevUserPosition);
    });
    this.player.on('timeupdate', () => {
      const currentTime = this.player.currentTime() || 0;
      if (this.playerState === 'play') {
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
        if (this.playerState === 'play') {
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
        if (this.playerState === 'play') {
          this.player.play();
        }
      }
    }
  }

  onPlayClicked() {
    this.playClicked.emit();
    this.playTrack(this.trackIndex);
  }

  onPauseClicked() {
    this.puaseClicked.emit();
    this.player.pause();
    this.cdr.markForCheck();
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
