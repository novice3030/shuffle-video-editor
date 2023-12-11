import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { playerState } from '../interfaces/player-state';
import { VideoSource } from '../interfaces/video-source';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  userPositionChanged$ = new BehaviorSubject<{
    position: number;
    trackIndex: number;
  }>({ position: 0, trackIndex: 0 });
  trackPosition = signal(0);
  videoPosition = signal(0);
  trackIndex = signal(0);
  playerState = signal<playerState>('stop');
  trackSources = signal<VideoSource[]>([]);
  selectedTrack = signal<VideoSource | undefined>(undefined);
  constructor() {}
}
