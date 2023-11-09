import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { HttpClient } from '@angular/common/http';
import { ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef, AfterViewChecked } from '@angular/core';
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

  @ViewChild('scrollableDiv', { static: false }) private scrollableDiv!: ElementRef;

  @ViewChild('dynamicBubble', { read: ViewContainerRef }) dynamicBubble: ViewContainerRef | null = null;
  
  constructor(private chatService : ChatService, private http:HttpClient, private componentFactoryResolver: ComponentFactoryResolver){}


  askQuestionEnter(e:any){
    e.preventDefault()
    this.askQuestion()
  }

  askQuestion() {  
    const questionTemp = this.question;
    this.question = "";
    
    if (this.dynamicBubble) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(RequestComponent);
      const componentRef = factory.create(this.dynamicBubble.injector);

      const requestComponent = componentRef.instance as RequestComponent;
      requestComponent.request = questionTemp;

      this.dynamicBubble.insert(componentRef.hostView);
    }

    this.chatService.post(questionTemp).subscribe((
      resp: any) => {
        console.log(resp);

        if (this.dynamicBubble) {
          const factory = this.componentFactoryResolver.resolveComponentFactory(ResponseComponent);
          const componentRef = factory.create(this.dynamicBubble.injector);
    
          const responseComponent = componentRef.instance as ResponseComponent;
          responseComponent.response = resp;
    
          this.dynamicBubble.insert(componentRef.hostView);
        }
      }
    )

    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollableDiv.nativeElement.scrollTop = this.scrollableDiv.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
