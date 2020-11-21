import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as socket from 'socket.io-client';
import Peer from 'simple-peer';

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
  isStreamAvailable = true;
  onlineUsers = [];
  myId: string;
  myStream: any;
  callerInfo: any;
  incomingCall = false;
  callerStream: any;

  ngAfterViewInit(): void {
    this.videoElement = this.videoRef.nativeElement;
    this.partnerVideoElement = this.partnerVideoRef.nativeElement;
    this.startUserMedia({ audio: false, video: true });
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
        this.videoRef.nativeElement.srcObject = stream;

        this.myStream = stream;
        this.videoRef.nativeElement.play();
        this.partnerVideoRef.nativeElement.play();
      },
      (err) => {
        this.isStreamAvailable = false;
        console.error(err);
      }
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
    const socketInstance = socket.io('http://localhost:3000');
    this.socket = socketInstance;

    socketInstance.on('myId', (id) => {
      console.log(`My Id - ${id}`);
      this.myId = id;
    });

    socketInstance.on('allUsers', (users) => {
      const usersArray = [];
      console.log(`All Users - ${JSON.stringify(this.onlineUsers)}`);
      for (const user in users) {
        if (
          Object.prototype.hasOwnProperty.call(users, user) &&
          user !== this.myId
        ) {
          const element = users[user];
          usersArray.push(element);
        }
      }
      if (usersArray.length) {
        this.onlineUsers = [].concat(usersArray);
      }
    });

    socketInstance.on('hey', (data) => {
      this.incomingCall = true;
      this.callerInfo = data.from;
      this.callerStream = data.signal;
    });
  }

  callUser(userId): void {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: 'stun:numb.viagenie.ca',
            username: 'sultan1640@gmail.com',
            credential: '98376683',
          },
          {
            urls: 'turn:numb.viagenie.ca',
            username: 'sultan1640@gmail.com',
            credential: '98376683',
          },
        ],
      },
      stream: this.myStream,
    });

    peer.on('signal', (data) => {
      this.socket.emit('callUser', {
        signalData: data,
        from: this.myId,
        userToCall: userId,
      });
    });

    peer.on('stream', (stream) => {
      this.partnerVideoRef.nativeElement.srcObject = stream;
    });

    this.socket.on('callAccepted', (signal) => {
      // setCallAccepted(true);
      peer.signal(signal);
    });
  }

  acceptCall(): void {
    // setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.myStream
    });

    peer.on('signal', (data) => {
      this.socket.emit('acceptCall', { signal: data, to: this.callerInfo });
    });

    peer.on('stream', (stream) => {
      this.partnerVideoRef.nativeElement.srcObject = stream;
    });

    peer.signal(this.callerStream);
  }
}
