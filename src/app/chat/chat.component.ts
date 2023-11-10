import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { HttpClient } from '@angular/common/http';
import { ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef} from '@angular/core';
import { RequestComponent } from '../request/request.component';
import { ResponseComponent } from '../response/response.component';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  question=""
  response:any
  isWaitingForResponse = false;
  shouldAutoScroll = false;

  @ViewChild('scrollableDiv') private scrollContainer!: ElementRef;

  onModelChange(textArea: HTMLTextAreaElement) {
    if (this.isWaitingForResponse == false) {
      textArea.focus();
    }
  }

  autoScroll(){
    window.scrollTo({top: this.scrollContainer.nativeElement.scrollHeight, behavior: 'smooth'});
  }

  @ViewChild('dynamicBubble', { read: ViewContainerRef }) dynamicBubble: ViewContainerRef | null = null;
  
  constructor(private loadingService: LoadingService, private chatService : ChatService, private http:HttpClient, private componentFactoryResolver: ComponentFactoryResolver){}

  askQuestionEnter(e:any){
    e.preventDefault()
    this.askQuestion()
  }

  askQuestion() {
    this.loadingService.show();
    const questionTemp = this.question;
    this.question = "";
    this.isWaitingForResponse = true;
    
    if (this.dynamicBubble) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(RequestComponent);
      const componentRef = factory.create(this.dynamicBubble.injector);

      const requestComponent = componentRef.instance as RequestComponent;
      requestComponent.request = questionTemp;

      this.dynamicBubble.insert(componentRef.hostView);
      setTimeout(() => {
        this.autoScroll();
      }, 500);
    }

    this.chatService.post(questionTemp).subscribe((
      resp: any) => {
        if (this.dynamicBubble) {
          const factory = this.componentFactoryResolver.resolveComponentFactory(ResponseComponent);
          const componentRef = factory.create(this.dynamicBubble.injector);
    
          const responseComponent = componentRef.instance as ResponseComponent;
          
          responseComponent.response = resp.text;

          this.loadingService.hide();
          this.dynamicBubble.insert(componentRef.hostView);
          this.isWaitingForResponse = false;
          setTimeout(() => {
            this.autoScroll();
          }, 500);
        }
      }
    )
  }
}
