import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { playerState } from '../../interfaces/player-state';
const colors = [
  '#3498db',
  '#2ecc71',
  '#e74c3c',
  '#f39c12',
  '#16a085',
  '#c0392b',
  '#1abc9c',
  '#f1c40f',
  '#2980b9',
  '#27ae60',
  '#d35400',
  '#8e44ad',
];
const markerWidth = 50;
@Component({
  selector: 'video-track',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatSliderModule,
    FormsModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './video-track.component.html',
  styleUrl: './video-track.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoTrackComponent implements OnChanges {
  @ViewChild('timeLine') timeLine!: ElementRef<HTMLElement>;
  @ViewChild('cursor') cursor!: ElementRef<HTMLElement>;
  @Output() trackItemsChanged = new EventEmitter<VideoSource[]>();
  @Output() trackIndexChanged = new EventEmitter<number>();
  @Output() trackItemClicked = new EventEmitter<VideoSource>();
  @Input() position = 0;
  @Input() totalDuration = 0;
  @Input() scale = 10;
  @Input() sources: VideoSource[] = [];
  @Input() selectedTrack: VideoSource | undefined;
  @Input() playerState!: playerState;
  @Output() positionChanged = new EventEmitter<number>();
  @Output() deleteTrackClicked = new EventEmitter<number>();
  constructor(private state: StateService) {}
  markers: Marker[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['position'] && this.playerState === 'play') {
      this.cursor.nativeElement.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'auto',
      });
    }
    if (changes['totalDuration']) {
      this.initMarkers();
    }
  }

  drop(event: CdkDragDrop<VideoSource[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.sources, event.previousIndex, event.currentIndex);
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
      let tempPosition = this.position;
      const timelineContainer = this.timeLine.nativeElement.parentElement;
      if (timelineContainer) {
        const timelineScrollLeft = timelineContainer.scrollLeft;
        const newPosition = (event.x + timelineScrollLeft - 10) / this.scale;
        this.position = newPosition;
        tempPosition = newPosition;
        let trackIndex = 0;
        let cumulativeDuration = 0;
        let prevDuration = 0;
        for (let i = 0; i < this.sources.length; i++) {
          const trackStart = i === 0 ? 0 : cumulativeDuration;
          const trackEnd = trackStart + this.sources[i].duration * this.scale;
          if (i > 0) {
            prevDuration += this.sources[i - 1].duration;
          }
          if (
            event.x + timelineScrollLeft >= trackStart &&
            event.x + timelineScrollLeft <= trackEnd
          ) {
            trackIndex = i;
            tempPosition -= prevDuration;
            this.trackIndexChanged.emit(trackIndex);
            this.positionChanged.emit(this.position);
            this.state.userPositionChanged$.next({
              position: tempPosition,
              trackIndex,
            });
            break;
          }

          cumulativeDuration += this.sources[i].duration * this.scale;
        }
      }
    }
  }

  onDeleteTrackClicked(trackIndex: number) {
    this.deleteTrackClicked.emit(trackIndex);
  }

  onTrackItemClicked(event: VideoSource) {
    this.trackItemClicked.emit(event);
  }

  private initMarkers() {
    this.markers = [];
    const totalDuration = this.totalDuration;
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
  }
}
