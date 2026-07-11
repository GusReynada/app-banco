import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage, CommonModule, DatePipe } from '@angular/common';
import { TransferenciaService, TransferenciaEstado } from '../transferencia.service';

@Component({
  selector: 'app-exito',
  imports: [NgOptimizedImage, CommonModule],
  providers: [DatePipe],
  templateUrl: './exito.html',
  styleUrl: './exito.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExitoComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly transferenciaService = inject(TransferenciaService);
  
  protected readonly estado = signal<TransferenciaEstado | null>(null);
  protected readonly fechaOperacion = new Date();
  protected folio = Math.floor(Math.random() * 9000000) + 1000000; // Folio por defecto

  ngOnInit(): void {
    const estadoActual = this.transferenciaService.getEstado();
    
    // Si no hay datos (por ejemplo, refresco de página), redirigimos al home
    if (!estadoActual.monto) {
      this.router.navigate(['/home']);
      return;
    }
    
    this.estado.set(estadoActual);
    
    // Leer el folio inyectado por el router state
    const state = history.state as { folio?: number } | undefined;
    if (state && state.folio) {
      this.folio = state.folio;
    }
    
    // Al llegar al éxito, limpiamos el estado del servicio para futuras transferencias
    // pero mantenemos la lista de contactos (que es lo que hace el método limpiarTransferencia)
    this.transferenciaService.limpiarTransferencia();
  }

  irAHome(): void {
    this.router.navigate(['/home']);
  }

  compartir(): void {
    // Simulación de compartir
    alert('Comprobante copiado al portapapeles');
  }
}
