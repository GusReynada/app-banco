import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage, CommonModule, CurrencyPipe } from '@angular/common';
import { TransferenciaService, TransferenciaEstado } from '../transferencia.service';

@Component({
  selector: 'app-confirmacion',
  imports: [NgOptimizedImage, CommonModule],
  providers: [CurrencyPipe],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmacionComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly transferenciaService = inject(TransferenciaService);
  
  // Estado completo de la transferencia
  protected readonly estado = signal<TransferenciaEstado | null>(null);
  
  // Estado de carga para simular la transacción
  protected readonly procesando = signal(false);

  ngOnInit(): void {
    const estadoActual = this.transferenciaService.getEstado();
    
    // Validación de seguridad: si falta algún dato esencial, volvemos al inicio del flujo
    if (!estadoActual.contacto || !estadoActual.monto || !estadoActual.cuentaOrigen) {
      this.router.navigate(['/transferencia']);
      return;
    }
    
    this.estado.set(estadoActual);
  }

  // Volver al paso de editar el monto
  volverAMonto(): void {
    this.router.navigate(['/monto']);
  }

  // Cancelar todo y volver al Home
  cancelar(): void {
    this.transferenciaService.limpiarTransferencia();
    this.router.navigate(['/home']);
  }

  // Ejecutar la transferencia (simulada)
  confirmarTransferencia(): void {
    this.procesando.set(true);
    const folioGenerado = Math.floor(Math.random() * 9000000) + 1000000;
    
    // Simulamos un retraso de red de 1.5 segundos para dar realismo
    setTimeout(() => {
      this.transferenciaService.consumarTransferencia(folioGenerado);
      this.procesando.set(false);
      this.router.navigate(['/exito'], { state: { folio: folioGenerado } });
    }, 1500);
  }
}
