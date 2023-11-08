import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { HttpClient } from '@angular/common/http';
import { ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { RequestComponent } from '../request/request.component';
import { ResponseComponent } from '../response/response.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  question=""
  response:any

  @ViewChild('dynamicBubble', { read: ViewContainerRef }) dynamicBubble: ViewContainerRef | null = null;
  
  constructor(private chatService : ChatService, private http:HttpClient, private componentFactoryResolver: ComponentFactoryResolver){}

  askQuestion() {
    if (this.dynamicBubble) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(RequestComponent);
      const componentRef = factory.create(this.dynamicBubble.injector);

      const requestComponent = componentRef.instance as RequestComponent;
      requestComponent.request = this.question;

      this.dynamicBubble.insert(componentRef.hostView);
    }

    this.chatService.post(this.question).subscribe((
      resp: any) => {
        console.log(resp.response);

        if (this.dynamicBubble) {
          const factory = this.componentFactoryResolver.resolveComponentFactory(ResponseComponent);
          const componentRef = factory.create(this.dynamicBubble.injector);
    
          const responseComponent = componentRef.instance as ResponseComponent;
          responseComponent.response = resp.response;
    
          this.dynamicBubble.insert(componentRef.hostView);
        }
      }
    )
  }

  addComponent() {
    if (this.dynamicBubble) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(RequestComponent);
      const componentRef = factory.create(this.dynamicBubble.injector);

      const requestComponent = componentRef.instance as RequestComponent;
      requestComponent.request = this.question;

      this.dynamicBubble.insert(componentRef.hostView);
    }
  }
}
