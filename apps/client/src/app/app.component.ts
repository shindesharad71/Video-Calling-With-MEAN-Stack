import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'sharad-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('videoRef') videoRef: ElementRef;

  ngAfterViewInit(): void {
    this.startUserMedia();
  }

  startUserMedia(): void {
    const n = <any>navigator;
    n.getUserMedia =
      n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;

    n.getUserMedia(
      { audio: true, video: true },
      (stream) => {
        this.videoRef.nativeElement.srcObject = stream;
        this.videoRef.nativeElement.play();
      },
      (err) => console.error(err)
    );
  }
}
