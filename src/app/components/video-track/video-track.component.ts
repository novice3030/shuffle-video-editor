import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { VideoSource } from '../../interfaces/video-source';
import videojs from 'video.js';
import { Marker } from '../../interfaces/marker';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { UserPositionEvent } from '../../interfaces/user-position-event';
const colors = ['red', 'green', 'blue', 'yellow', 'brown', 'gold', 'orange'];
const markerWidth = 50;
@Component({
  selector: 'video-track',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatSliderModule, FormsModule],
  templateUrl: './video-track.component.html',
  styleUrl: './video-track.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoTrackComponent implements OnChanges {
  @ViewChild('timeLine') timeLine!: ElementRef<HTMLElement>;
  @ViewChild('cursor') cursor!: ElementRef<HTMLElement>;
  @Output() trackItemsChanged = new EventEmitter<VideoSource[]>();
  @Input() position = 0;
  @Input() scale = 1;
  @Output() positionChanged = new EventEmitter<UserPositionEvent>();
  constructor(private cdr: ChangeDetectorRef) {}
  sources: VideoSource[] = [];
  markers: Marker[] = [];

  ngOnChanges() {
    if (this.cursor) {
      this.cursor.nativeElement.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'auto',
      });
    }
  }

  drop(event: CdkDragDrop<VideoSource[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.sources, event.previousIndex, event.currentIndex);
      this.cdr.markForCheck();
      this.trackItemsChanged.emit(this.sources);
    } else {
      const sourceToAdd = event.item.data as VideoSource;
      const player = videojs('video-player');
      const metadataLoaded = () => {
        const playerDuration = player.duration() || 0;
        sourceToAdd.duration = playerDuration;
        if (this.sources.length > 0) {
          sourceToAdd.startTime =
            this.sources[this.sources.length - 1].endTime || 0;
          sourceToAdd.endTime =
            playerDuration + this.sources[this.sources.length - 1].duration;
        } else {
          sourceToAdd.startTime = 0;
          sourceToAdd.endTime = player.duration() || 0;
        }
        sourceToAdd.color = colors[this.sources.length];
        sourceToAdd.width = player.duration() || 0;
        transferArrayItem(
          [structuredClone(sourceToAdd)],
          this.sources,
          event.previousIndex,
          event.currentIndex
        );
        this.initMarkers();
        this.trackItemsChanged.emit(this.sources);
        player.off('loadedmetadata', metadataLoaded);
      };
      player.src(sourceToAdd.source);
      player.load();
      player.on('loadedmetadata', metadataLoaded);
    }
  }

  onScaleChanged(event: number) {
    this.initMarkers();
  }

  onTimelineClicked(event: MouseEvent) {
    if (this.sources.length > 0) {
      const timelineContainer = this.timeLine.nativeElement.parentElement;
      if (timelineContainer) {
        const timelineScrollLeft = timelineContainer.scrollLeft;
        const newPosition = (event.x + timelineScrollLeft - 10) / this.scale;
        this.position = newPosition;

        let trackIndex = 0;
        let relativePosition = 0;
        let cumulativeDuration = 0;
        for (let i = 0; i < this.sources.length; i++) {
          const trackStart = i === 0 ? 0 : cumulativeDuration;
          const trackEnd = trackStart + this.sources[i].duration * this.scale;

          if (event.x >= trackStart && event.x <= trackEnd) {
            trackIndex = i;
            relativePosition = (event.x - trackStart) / this.scale;
            this.positionChanged.emit({
              position: relativePosition,
              trackIndex,
            });
            break;
          }

          cumulativeDuration += this.sources[i].duration * this.scale;
        }
      }
    }
  }

  private initMarkers() {
    this.markers = [];
    const totalDuration = this.getTotalDuration();
    const totalTrackWidth = totalDuration * this.scale;
    const maxMarkers = Math.floor(totalTrackWidth / markerWidth);
    for (let i = 0; i <= maxMarkers; i++) {
      let position = i * (totalTrackWidth / maxMarkers);
      position = isNaN(Math.floor(position / this.scale))
        ? 0
        : Math.floor(position / this.scale);
      this.markers.push({
        position,
        text: position + 's',
        width: 0,
      });
    }
    this.cdr.markForCheck();
  }

  private getTotalDuration(): number {
    return this.sources.reduce((total, video) => total + video.duration, 0);
  }
}
