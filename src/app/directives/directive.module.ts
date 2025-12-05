import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { LazyLoadDirective } from './lazy-load.directive';
import { InfiniteScrollDirective } from './infinite-scroll.directive';
import { NoteProcessorDirective } from './note-processor.directive';
import { HrefToRouterLinkDirective } from './href-to-router-link.directive';
import { InputActivityDirective } from './input-activity.directive';

@NgModule({
    declarations: [
        LazyLoadDirective,
        InfiniteScrollDirective,
        NoteProcessorDirective,
        HrefToRouterLinkDirective,
        InputActivityDirective
    ],
    imports: [
        BrowserModule,
        FormsModule
    ],
    exports: [
        LazyLoadDirective,
        InfiniteScrollDirective,
        NoteProcessorDirective,
        HrefToRouterLinkDirective,
        InputActivityDirective
    ]
})
export class DirectivesModule { }
