import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VideoSource } from '../interfaces/video-source';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'source-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CdkDrag,
    CdkDropList,
  ],
  templateUrl: './source-list.component.html',
  styleUrl: './source-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceListComponent {
  @Input() sources: VideoSource[] = [];
  @Output() play = new EventEmitter<VideoSource>();
  @Output() pause = new EventEmitter<VideoSource>();

  onPlayClicked(source: VideoSource) {
    this.sources.forEach((source) => (source.isPlaying = false));
    source.isPlaying = true;
    this.play.emit(source);
  }

  onPlayPauseClicked(source: VideoSource) {
    source.isPlaying = false;
    this.pause.emit(source);
  }
}
