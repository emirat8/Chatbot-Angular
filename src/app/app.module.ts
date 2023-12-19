import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChatComponent } from './chat/chat.component';
import { ResponseComponent } from './response/response.component';
import { RequestComponent } from './request/request.component';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from './loading/loading.component';
import { AutoFocusDirective } from './auto-focus.directive';
import { Chat2Component } from './chat2/chat2.component';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateFunctionComponent } from './create-function/create-function.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    ResponseComponent,
    RequestComponent,
    LoadingComponent,
    AutoFocusDirective,
    Chat2Component,
    MainComponent,
    LoginComponent,
    DashboardComponent,
    CreateFunctionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
