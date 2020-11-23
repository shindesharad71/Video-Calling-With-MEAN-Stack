import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as socket from 'socket.io-client';
import Peer from 'simple-peer';
import {
  faMicrophone,
  faVideo,
  faDesktop,
  faPhoneSlash,
} from '@fortawesome/free-solid-svg-icons';

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
  myStream: any;
  callerStream: any;

  isPlaying = false;
  displayControls = true;
  isStreamAvailable = true;
  incomingCall = false;
  isCallAccepted = false;
  isCallInProgress = false;

  onlineUsers = [];
  socket: any;
  myId: string;
  callerInfo: any;

  isAudioEnabled = false;
  isVideoEnabled = true;

  callerSignal: any;

  VIDEO_CONFIG = {
    width: { min: 1024, ideal: 1280, max: 1920 },
    height: { min: 576, ideal: 720, max: 1080 },
  };

  // Icons
  microphone = faMicrophone;
  videoIcon = faVideo;
  desktop = faDesktop;
  endCallIcon = faPhoneSlash;

  ngAfterViewInit(): void {
    this.videoElement = this.videoRef.nativeElement;
    this.partnerVideoElement = this.partnerVideoRef.nativeElement;
    this.startUserMedia();
    this.initSocket();
  }

  startUserMedia(config?: any): void {
    let mediaConfig = {
      video: this.VIDEO_CONFIG,
      audio: this.isAudioEnabled,
    };

    if (config) {
      mediaConfig = config;
    }

    const n = <any>navigator;
    n.getUserMedia =
      n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;
    n.getUserMedia(
      mediaConfig,
      (stream: MediaStream) => {
        this.myStream = stream;
        this.videoRef.nativeElement.srcObject = this.myStream;
      },
      (err) => {
        this.isStreamAvailable = false;
        console.error(err);
      }
    );
  }

  toggleAudio(): void {
    this.isAudioEnabled = !this.isAudioEnabled;
    this.startUserMedia();
  }

  toggleVideo(): void {
    this.isVideoEnabled = !this.isVideoEnabled;
    if (this.isVideoEnabled) {
      this.startUserMedia({
        video: this.VIDEO_CONFIG,
        audio: this.isAudioEnabled,
      });
    } else {
      this.stopVideoOnly(this.myStream);
    }
  }

  endCall(): void {}

  initSocket(): void {
    const socketInstance = socket.io('http://localhost:3000');
    this.socket = socketInstance;

    socketInstance.on('myId', (id) => {
      this.myId = id;
    });

    socketInstance.on('allUsers', (users) => {
      const usersArray = [];
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
      this.callerSignal = data.signal;
    });
  }

  callUser(userId): void {
    this.isCallInProgress = true;
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
      this.callerStream = stream;
    });

    this.socket.on('callAccepted', (signal) => {
      this.incomingCall = false;
      this.isCallAccepted = true;
      peer.signal(signal);
    });
  }

  acceptCall(): void {
    this.incomingCall = false;
    this.isCallInProgress = true;
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.myStream,
    });

    peer.on('signal', (data) => {
      this.socket.emit('acceptCall', { signal: data, to: this.callerInfo });
    });

    peer.on('stream', (stream) => {
      this.partnerVideoRef.nativeElement.srcObject = stream;
      this.callerStream = stream;
    });

    peer.signal(this.callerSignal);
  }

  stopBothVideoAndAudio(stream) {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === 'live') {
        track.stop();
      }
    });
  }

  stopVideoOnly(stream) {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === 'live' && track.kind === 'video') {
        track.stop();
      }
    });
  }

  stopAudioOnly(stream) {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === 'live' && track.kind === 'audio') {
        track.stop();
      }
    });
  }
}
