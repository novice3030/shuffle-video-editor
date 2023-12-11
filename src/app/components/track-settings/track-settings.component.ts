import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VideoSource } from '../../interfaces/video-source';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'track-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './track-settings.component.html',
  styleUrl: './track-settings.component.scss',
})
export class TrackSettingsComponent implements OnInit, OnChanges {
  constructor(private fb: FormBuilder) {}
  form!: FormGroup;
  @Input() track!: VideoSource;
  @Output() trackChanged = new EventEmitter<VideoSource>();
  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.track?.name],
      color: [this.track?.color],
    });
    this.form.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.track.color = this.form.controls['color'].value;
      this.track.name = this.form.controls['name'].value;
      this.trackChanged.emit(this.track);
    });
  }

  ngOnChanges(): void {
    if (this.track && this.form) {
      this.form.controls['name'].setValue(this.track.name);
      this.form.controls['color'].setValue(this.track.color);
    }
  }
}
