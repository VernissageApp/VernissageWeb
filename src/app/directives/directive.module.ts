import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { LazyLoadDirective } from './lazy-load.directive';
import { AppRouterOutletDirective } from './app-router-outlet.directive';
import { InfiniteScrollDirective } from './infinite-scroll.directive';

@NgModule({
    declarations: [
        LazyLoadDirective,
        AppRouterOutletDirective,
        InfiniteScrollDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule
    ],
    exports: [
        LazyLoadDirective,
        AppRouterOutletDirective,
        InfiniteScrollDirective
    ]
})
export class DirectivesModule { }
