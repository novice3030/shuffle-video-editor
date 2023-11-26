export interface VideoSource {
  name: string;
  source: string;
  duration: number; // in seconds
  isPlaying?: boolean;
  width: number;
  startTime: number;
  endTime: number;
  color: string;
}
