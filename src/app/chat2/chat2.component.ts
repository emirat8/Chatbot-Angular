import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { HttpClient } from '@angular/common/http';
import {
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  ElementRef,
} from '@angular/core';
import { RequestComponent } from '../request/request.component';
import { ResponseComponent } from '../response/response.component';
import { LoadingService } from '../loading.service';
import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat2',
  templateUrl: './chat2.component.html',
  styleUrls: ['./chat2.component.css'],
})
export class Chat2Component {
  closeResult = '';
  question = '';
  response: any;
  errorMessage = '';
  userId: number = 0;
  isWaitingForResponse = false;
  shouldAutoScroll = false;
  token: string | null = '';
  fullName: string | null = '';

  @ViewChild('scrollableDiv') private scrollContainer!: ElementRef;
  @ViewChild('errorModal') errorModal: ElementRef | undefined;
  @ViewChild('dynamicBubble', { read: ViewContainerRef })
  dynamicBubble: ViewContainerRef | null = null;

  constructor(
    private route: Router,
    private modalService: NgbModal,
    private loadingService: LoadingService,
    private chatService: ChatService,
    private http: HttpClient,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  askQuestionEnter(e: any) {
    e.preventDefault();
    this.askQuestion();
  }

  isFaqPanelExpanded: boolean = false;

  frequentlyAskedQuestions = [
    'Bagaimana cara menggunakan chatbot ini?',
    'Siapa nama CMO dan cabang yang mengajukan konsumen atas nama : ',
    'Sudah di antrian urutan keberapa konsumen dengan AppId : ',
  ];

  toggleFaqPanel(): void {
    this.isFaqPanelExpanded = !this.isFaqPanelExpanded;
  }

  selectQuestion(faq: string): void {
    this.question = faq;
    this.isFaqPanelExpanded = false; // Optional: Menutup panel setelah pertanyaan dipilih
  }

  ngOnInit() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      const decodedToken: any = jwtDecode(this.token);
      this.userId = decodedToken.userId;
      this.fullName = decodedToken.fullname;
      console.log('User ID : ', this.userId);

      this.chatService.getChatHistory(this.userId.toString()).subscribe(
        (resp: any) => {
          if (resp.status === 200 && resp.data.length > 0) {
            resp.data.forEach((element: any) => {
              if (element.role == 'user') {
                if (this.dynamicBubble) {
                  const factory =
                    this.componentFactoryResolver.resolveComponentFactory(
                      RequestComponent
                    );
                  const componentRef = factory.create(
                    this.dynamicBubble.injector
                  );

                  const requestComponent =
                    componentRef.instance as RequestComponent;
                  requestComponent.request = element.content;
                  requestComponent.fullName = this.fullName;

                  this.dynamicBubble.insert(componentRef.hostView);
                }
              } else if (element.role == 'assistant') {
                if (this.dynamicBubble) {
                  const factory =
                    this.componentFactoryResolver.resolveComponentFactory(
                      ResponseComponent
                    );
                  const componentRef = factory.create(
                    this.dynamicBubble.injector
                  );

                  const responseComponent =
                    componentRef.instance as ResponseComponent;

                  responseComponent.response = element.content;

                  this.dynamicBubble.insert(componentRef.hostView);
                }
              }
            });
            setTimeout(() => {
              this.autoScroll();
            }, 500);
          } else if (resp.status === 200 && resp.data.length == 0) {
            console.log('Chat history empty');
          } else {
            this.loadingService.hide();
            this.isWaitingForResponse = false;
            this.open(this.errorModal, resp.text);
          }
        },
        (error) => {
          this.loadingService.hide();
          this.isWaitingForResponse = false;
          // Tangani error jika terjadi kesalahan jaringan, dll.
          this.open(
            this.errorModal,
            'Gagal mendapatkan respons: ' + error.message
          );
        }
      );
    } else {
      this.route.navigate(['login']);
    }
  }

  logout() {
    localStorage.clear();
    this.route.navigate(['login']);
  }

  clear_chat() {
    this.chatService
      .deleteChatHistory(this.userId.toString())
      .subscribe((resp: any) => {
        if (resp.status === 200) {
          console.log('Chat history deleted');
          this.dynamicBubble?.clear();
        } else {
          this.loadingService.hide();
          this.isWaitingForResponse = false;
          this.open(this.errorModal, resp.text);
        }
      });
  }

  askQuestion() {
    if (this.question == '') {
      this.open(this.errorModal, 'Pertanyaan tidak boleh kosong');
    } else {
      this.loadingService.show();
      const questionTemp = this.question;
      const user_id = this.userId;
      this.question = '';
      this.isWaitingForResponse = true;

      if (this.dynamicBubble) {
        const factory =
          this.componentFactoryResolver.resolveComponentFactory(
            RequestComponent
          );
        const componentRef = factory.create(this.dynamicBubble.injector);

        const requestComponent = componentRef.instance as RequestComponent;
        requestComponent.request = questionTemp;
        requestComponent.fullName = this.fullName;

        this.dynamicBubble.insert(componentRef.hostView);
        setTimeout(() => {
          this.autoScroll();
        }, 500);
      }

      this.chatService
        .postForDynamic(questionTemp, user_id.toString())
        .subscribe(
          (resp: any) => {
            if (resp.status === 200) {
              if (this.dynamicBubble) {
                const factory =
                  this.componentFactoryResolver.resolveComponentFactory(
                    ResponseComponent
                  );
                const componentRef = factory.create(
                  this.dynamicBubble.injector
                );

                const responseComponent =
                  componentRef.instance as ResponseComponent;

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
          (error) => {
            this.loadingService.hide();
            this.isWaitingForResponse = false;
            // Tangani error jika terjadi kesalahan jaringan, dll.
            this.open(
              this.errorModal,
              'Gagal mendapatkan respons: ' + error.message
            );
          }
        );
    }
  }

  onModelChange(textArea: HTMLTextAreaElement) {
    if (this.isWaitingForResponse == false) {
      textArea.focus();
    }
  }

  autoScroll() {
    const scrollElement = document.getElementById('test');
    if (scrollElement) {
      scrollElement.scrollTo({
        top: this.scrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  open(content: any, message: string) {
    this.errorMessage = message;
    this.modalService.open(content);
  }
}
