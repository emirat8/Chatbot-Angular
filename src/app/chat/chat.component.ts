import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { HttpClient } from '@angular/common/http';
import { ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef} from '@angular/core';
import { RequestComponent } from '../request/request.component';
import { ResponseComponent } from '../response/response.component';
import { LoadingService } from '../loading.service';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  closeResult = '';
  question=""
  response:any
  errorMessage=""
  isWaitingForResponse = false;
  shouldAutoScroll = false;

  @ViewChild('scrollableDiv') private scrollContainer!: ElementRef;
  @ViewChild('errorModal') errorModal: ElementRef | undefined;
  @ViewChild('dynamicBubble', { read: ViewContainerRef }) dynamicBubble: ViewContainerRef | null = null;
  
  constructor(private modalService: NgbModal, private loadingService: LoadingService, private chatService : ChatService, private http:HttpClient, private componentFactoryResolver: ComponentFactoryResolver){}

  askQuestionEnter(e:any){
    e.preventDefault()
    this.askQuestion()
  }

  askQuestion() {
    if (this.question == "") {
      this.open(this.errorModal, "Pertanyaan tidak boleh kosong")
    } else {
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
          if (resp.status === 200) {
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
          } else {
            this.loadingService.hide();
            this.isWaitingForResponse = false;
            this.open(this.errorModal, resp.text);
          }
        },
        error => {
          this.loadingService.hide();
          this.isWaitingForResponse = false;
          // Tangani error jika terjadi kesalahan jaringan, dll.
          this.open(this.errorModal, "Gagal mendapatkan respons: " + error.message);
        }
      )
    }
  }

  onModelChange(textArea: HTMLTextAreaElement) {
    if (this.isWaitingForResponse == false) {
      textArea.focus();
    }
  }

  autoScroll(){
    window.scrollTo({top: this.scrollContainer.nativeElement.scrollHeight, behavior: 'smooth'});
  }

  open(content: any, message: string) {
    this.errorMessage = message
    this.modalService.open(content)
  }
}
