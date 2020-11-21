import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as socket from 'socket.io-client';

@Component({
  selector: 'sharad-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('videoRef') videoRef: ElementRef;
  @ViewChild('partnerVideoRef') partnerVideoRef: ElementRef;
  videoElement: any;
  partnerVideoElement: any;
  isPlaying = false;
  displayControls = true;
  socket: any;
  isStreamAvailable = false;

  ngAfterViewInit(): void {
    this.videoElement = this.videoRef.nativeElement;
    this.partnerVideoElement = this.partnerVideoRef.nativeElement;
    // this.startUserMedia({ audio: false, video: true });
    this.initSocket();
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
        this.isStreamAvailable = true;
        this.videoRef.nativeElement.srcObject = stream;
        this.partnerVideoRef.nativeElement.srcObject = stream;
        this.videoRef.nativeElement.play();
        this.partnerVideoRef.nativeElement.play();
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

  initSocket(): void {
    const socketInstance = socket.io('http://localhost:3000/');
    this.socket = socketInstance;

    socketInstance.on('yourID', (id) => {
      console.log(id);

    });
    socketInstance.on('allUsers', (users) => {
      console.log(users);
    });

    socketInstance.on('hey', (data) => {
      console.log(data);
    });
  }
}
