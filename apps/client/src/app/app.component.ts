import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'sharad-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('videoRef') videoRef: ElementRef;
  videoElement: any;
  isPlaying = false;
  displayControls = true;

  ngAfterViewInit(): void {
    this.videoElement = this.videoRef.nativeElement;
    this.startUserMedia({ audio: false, video: true });
  }

  startUserMedia(config: any): void {
    const n = <any>navigator;
    n.getUserMedia =
      n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;

    n.getUserMedia(
      config,
      (stream) => {
        this.videoRef.nativeElement.srcObject = stream;
        this.videoRef.nativeElement.play();
      },
      (err) => console.error(err)
    );
  }

  start() {
    this.startUserMedia({ video: true, audio: false });
  }

  pause() {
    this.videoElement.pause();
  }

  toggleControls() {
    this.videoElement.controls = this.displayControls;
    this.displayControls = !this.displayControls;
  }

  resume() {
    this.videoElement.play();
  }

  sound() {
    this.startUserMedia({ video: true, audio: true });
  }
}
