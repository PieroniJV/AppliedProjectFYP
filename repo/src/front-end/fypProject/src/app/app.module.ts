import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PasswordHandlerService } from './password-handler.service';
import { PASSWORD_HANDLER_TOKEN } from './password-handler.service';
import { IDatabaseInterface } from "./database.interface";
import { DATABASE_SERVICE_TOKEN } from './mockDatabase.service';
import { MockDatabaseService } from './mockDatabase.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: PASSWORD_HANDLER_TOKEN, useClass: PasswordHandlerService },
    { provide: DATABASE_SERVICE_TOKEN, useClass: MockDatabaseService },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
