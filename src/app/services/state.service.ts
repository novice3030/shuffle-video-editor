import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  userPositionChanged$ = new BehaviorSubject<{
    position: number;
    trackIndex: number;
  }>({ position: 0, trackIndex: 0 });
  constructor() {}
}
