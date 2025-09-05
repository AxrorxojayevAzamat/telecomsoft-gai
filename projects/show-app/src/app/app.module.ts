import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VehicleDrbNumberModule } from 'vehicle-drb-number';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    VehicleDrbNumberModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
