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
  constructor(private cdr: ChangeDetectorRef) {}

  @ViewChild('videoPreview', { static: true }) videoPreview!: ElementRef;
  @Input() source?: VideoSource;
  @Input() trackSources: VideoSource[] = [];
  @Input() pause = false;
  @Output() positionChanged = new EventEmitter<number>();
  @Input() position = 0;
  @Input() trackIndex = 0;
  private player!: Player;
  state: 'play' | 'pause' = 'pause';

  ngAfterViewInit(): void {
    this.player = videojs(this.videoPreview.nativeElement, {
      controls: false,
      fluid: true,
      aspectRatio: '8:3',
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.player && this.source) {
      if (this.player.currentSrc() !== this.source.source) {
        this.player.src(this.source.source);
        this.player.load();
        this.player.play();
      } else {
        if (!this.source.isPlaying) {
          this.player.pause();
        } else {
          this.player.play();
        }
      }
    }
    if (this.player && this.position) {
      if (
        changes['trackIndex']?.currentValue !==
        changes['trackIndex']?.previousValue
      ) {
        this.player.src(this.trackSources[this.trackIndex].source);
        this.player.load();
        if (this.state === 'play') {
          this.player.currentTime(this.position);
          this.player.play();
        } else {
          this.player.currentTime(this.position);
        }
      } else {
        this.player.currentTime(this.position);
      }
    }
  }

  onPlayClicked() {
    this.state = 'play';
    this.cdr.markForCheck();
    this.playTrack(this.trackIndex);
    this.player.on('ended', () => {
      this.trackIndex++;
      if (this.trackIndex < this.trackSources.length) {
        this.playTrack(this.trackIndex);
      } else if (this.trackIndex === this.trackSources.length) {
        this.state = 'pause';
        this.cdr.markForCheck();
      }
    });
    this.player.on('timeupdate', () => {
      const currentTime = this.player.currentTime() || 0;
      if (this.trackIndex === 0) {
        this.positionChanged.emit(currentTime);
      } else if (this.trackIndex > 0) {
        const position = this.calcPosition(this.trackIndex, currentTime);
        this.positionChanged.emit(position);
      }
    });
  }

  onPauseClicked() {
    this.state = 'pause';
    this.player.pause();
    this.cdr.markForCheck();
  }

  private calcPosition(currentTrackIndex: number, currentTime: number): number {
    let totalDuration = 0;
    for (let i = 0; i < currentTrackIndex; i++) {
      totalDuration += this.trackSources[i].duration;
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
