import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ScrollNearEndDirective } from './scroll-near-end.directive';
import { LazyLoadDirective } from './lazy-load.directive';
import { NoteProcessorDirective } from './note-processor.directive';
import { HrefToRouterLinkDirective } from './href-to-router-link.directive';

@NgModule({
    declarations: [
        ScrollNearEndDirective,
        LazyLoadDirective,
        NoteProcessorDirective,
        HrefToRouterLinkDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule
    ],
    exports: [
        ScrollNearEndDirective,
        LazyLoadDirective,
        NoteProcessorDirective,
        HrefToRouterLinkDirective
    ]
})
export class DirectivesModule { }
