import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-mis-tarjetas',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './mis-tarjetas.html',
  styleUrl: './mis-tarjetas.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisTarjetasComponent {
  private readonly router = inject(Router);

  // Estados de rotación (true = reverso/CVV, false = frente/números)
  protected readonly debitoFlipped = signal<boolean>(false);
  protected readonly creditoFlipped = signal<boolean>(false);

  // Estados de bloqueo/congelación
  protected readonly debitoCongelada = signal<boolean>(false);
  protected readonly creditoCongelada = signal<boolean>(false);

  volver(): void {
    this.router.navigate(['/home']);
  }

  toggleFlipDebito(): void {
    this.debitoFlipped.update(v => !v);
  }

  toggleFlipCredito(): void {
    this.creditoFlipped.update(v => !v);
  }

  toggleCongelarDebito(event: Event): void {
    event.stopPropagation(); // Evitar voltear la tarjeta al dar click al interruptor
    this.debitoCongelada.update(v => !v);
  }

  toggleCongelarCredito(event: Event): void {
    event.stopPropagation();
    this.creditoCongelada.update(v => !v);
  }
}
