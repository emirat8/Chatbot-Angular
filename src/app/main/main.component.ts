import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  showChat = 1;
  
  showWhatChat(number : number) {
    this.showChat = number;
  }

}
