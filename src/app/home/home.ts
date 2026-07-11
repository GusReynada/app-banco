import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { TransferenciaService } from '../transferencia.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly transferService = inject(TransferenciaService);
  private subscription?: Subscription;

  // Datos simulados del cliente
  protected readonly clienteNombre = signal('Jorge!');
  
  // Saldo reactivo
  protected readonly saldoDisponible = signal(0);

  ngOnInit(): void {
    // Suscripción al saldo disponible del servicio
    this.subscription = this.transferService.saldoDisponible$.subscribe(saldo => {
      this.saldoDisponible.set(saldo);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // Navegación
  irATransferencia(): void {
    this.router.navigate(['/transferencia']);
  }

  irANuevoContacto(): void {
    this.router.navigate(['/nuevo-contacto']);
  }

  irAMovimientos(): void {
    this.router.navigate(['/movimientos']);
  }

  irAMisTarjetas(): void {
    this.router.navigate(['/mis-tarjetas']);
  }

  cerrarSesion(): void {
    this.transferService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
