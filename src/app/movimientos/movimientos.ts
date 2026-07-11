import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TransferenciaService, Movimiento } from '../transferencia.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movimientos',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientosComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly transferService = inject(TransferenciaService);
  private subscription?: Subscription;

  protected readonly movimientos = signal<Movimiento[]>([]);

  ngOnInit(): void {
    this.subscription = this.transferService.movimientos$.subscribe(list => {
      this.movimientos.set(list);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}
