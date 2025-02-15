import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { LazyLoadDirective } from './lazy-load.directive';
import { InfiniteScrollDirective } from './infinite-scroll.directive';
import { NoteProcessorDirective } from './note-processor.directive';
import { HrefToRouterLinkDirective } from './href-to-router-link.directive';

@NgModule({
    declarations: [
        LazyLoadDirective,
        InfiniteScrollDirective,
        NoteProcessorDirective,
        HrefToRouterLinkDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule
    ],
    exports: [
        LazyLoadDirective,
        InfiniteScrollDirective,
        NoteProcessorDirective,
        HrefToRouterLinkDirective
    ]
})
export class DirectivesModule { }
