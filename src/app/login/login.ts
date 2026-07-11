import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TransferenciaService } from '../transferencia.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly transferService = inject(TransferenciaService);

  protected readonly pin = signal<string>('');
  protected readonly errorMsg = signal<string>('');
  protected readonly procesando = signal<boolean>(false);

  // Intentar agregar un dígito al PIN
  presionarTecla(tecla: string): void {
    if (this.procesando() || this.errorMsg()) {
      // Si hay error, limpiar al presionar de nuevo
      if (this.errorMsg()) {
        this.pin.set('');
        this.errorMsg.set('');
      } else {
        return;
      }
    }

    const pinActual = this.pin();
    if (pinActual.length < 4) {
      const nuevoPin = pinActual + tecla;
      this.pin.set(nuevoPin);

      // Si se completaron los 4 dígitos, validar automáticamente
      if (nuevoPin.length === 4) {
        this.procesarAutenticacion(nuevoPin);
      }
    }
  }

  // Eliminar el último dígito escrito
  borrarDigito(): void {
    if (this.procesando()) return;
    this.errorMsg.set('');
    const pinActual = this.pin();
    if (pinActual.length > 0) {
      this.pin.set(pinActual.slice(0, -1));
    }
  }

  // Lógica de validación
  private procesarAutenticacion(pinIngresado: string): void {
    this.procesando.set(true);

    // Simular pequeña latencia de autenticación (0.6s) para dar mejor feedback visual
    setTimeout(() => {
      const exito = this.transferService.iniciarSesion(pinIngresado);
      this.procesando.set(false);

      if (exito) {
        this.router.navigate(['/home']);
      } else {
        this.errorMsg.set('PIN incorrecto. Reintente.');
        // Efecto háptico / sacudida visual
      }
    }, 600);
  }
}
