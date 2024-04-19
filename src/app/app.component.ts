import { Component, OnDestroy, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoadingService } from './services/common/loading.service';
import { RoutingStateService } from './services/common/routing-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  showLoader = false;
  loadingStateChangesSubscription?: Subscription;

  constructor(
    private loadingService: LoadingService,
    private routingStateService: RoutingStateService,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.routingStateService.startRoutingListener();
  }

  ngAfterViewInit(): void {
    this.loadingStateChangesSubscription = this.loadingService.loadingStateChanges.subscribe(isLoading => {
      this.showLoader = isLoading;
      this.changeDetectorRef.detectChanges();
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.loadingStateChangesSubscription?.unsubscribe();
  }
}
