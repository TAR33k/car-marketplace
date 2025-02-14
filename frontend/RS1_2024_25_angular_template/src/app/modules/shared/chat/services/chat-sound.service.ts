import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatSoundService {
  private readonly sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled = true;

  constructor() {
    // Initialize sounds
    this.sounds = {
      messageSent: new Audio('assets/sounds/message-sent.wav'),
      messageReceived: new Audio('assets/sounds/message-received.wav'),
      notificationReceived: new Audio('assets/sounds/notification.mp3')
    };

    // Preload sounds
    Object.values(this.sounds).forEach(audio => {
      audio.load();
      audio.volume = 0.5; // Set default volume to 50%
    });
  }

  toggleSounds(enabled: boolean): void {
    this.enabled = enabled;
  }

  playMessageSent(): void {
    this.playSound('messageSent');
  }

  playMessageReceived(): void {
    this.playSound('messageReceived');
  }

  playNotification(): void {
    this.playSound('notificationReceived');
  }

  private playSound(soundName: string): void {
    if (!this.enabled) return;

    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0; // Reset to start
      sound.play().catch(error => {
        console.warn('Error playing sound:', error);
      });
    }
  }
}
