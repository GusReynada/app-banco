import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { TransferenciaService, Contacto } from '../transferencia.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transferencia',
  imports: [NgOptimizedImage, CommonModule],
  templateUrl: './transferencia.html',
  styleUrl: './transferencia.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferenciaComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly transferenciaService = inject(TransferenciaService);
  private subscription?: Subscription;

  // Señal local con la lista completa de contactos
  protected readonly contactos = signal<Contacto[]>([]);

  // Estados derivados usando computed()
  protected readonly contactosFrecuentes = computed(() => 
    this.contactos().filter(c => c.frecuente)
  );
  
  protected readonly contactosNormales = computed(() => 
    this.contactos().filter(c => !c.frecuente)
  );

  ngOnInit(): void {
    // Suscripción al flujo reactivo de contactos
    this.subscription = this.transferenciaService.contactos$.subscribe(contactosList => {
      this.contactos.set(contactosList);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // Volver al home
  volverAHome(): void {
    this.router.navigate(['/home']);
  }

  // Redirigir a crear un nuevo contacto
  irANuevoContacto(): void {
    this.router.navigate(['/nuevo-contacto']);
  }

  // Seleccionar contacto e ir al Frame 4 (Monto)
  seleccionarContacto(contacto: Contacto): void {
    this.transferenciaService.seleccionarContacto(contacto);
    this.router.navigate(['/monto']);
  }

  // Eliminar un contacto de forma reactiva, evitando la navegación
  eliminarContacto(event: Event, id: number): void {
    event.stopPropagation(); // Detener propagación para evitar seleccionar el contacto
    this.transferenciaService.eliminarContacto(id);
  }
}
