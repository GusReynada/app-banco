import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage, CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TransferenciaService, Contacto } from '../transferencia.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-monto',
  imports: [NgOptimizedImage, CommonModule, ReactiveFormsModule],
  providers: [CurrencyPipe],
  templateUrl: './monto.html',
  styleUrl: './monto.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MontoComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly transferenciaService = inject(TransferenciaService);
  private subSaldo?: Subscription;
  
  // Contacto seleccionado obtenido del servicio
  protected readonly contacto = signal<Contacto | null>(null);
  
  // Cuenta seleccionada (Débito por defecto)
  protected readonly cuentaSeleccionada = signal<'Débito' | 'Crédito'>('Débito');

  // Saldo dinámico
  protected readonly saldoDisponible = signal<number>(0);

  // Formulario para el monto
  protected readonly montoForm = this.fb.nonNullable.group({
    monto: [null as any, [Validators.required, Validators.min(1)]]
  }, {
    validators: (control: AbstractControl): ValidationErrors | null => {
      const montoVal = control.get('monto')?.value;
      if (montoVal && this.cuentaSeleccionada() === 'Débito' && montoVal > this.saldoDisponible()) {
        return { fondosInsuficientes: true };
      }
      return null;
    }
  });

  ngOnInit(): void {
    const estado = this.transferenciaService.getEstado();
    if (!estado.contacto) {
      // Si no hay contacto seleccionado, regresamos al flujo de selección
      this.router.navigate(['/transferencia']);
      return;
    }
    this.contacto.set(estado.contacto);

    // Obtener saldo en tiempo real
    this.subSaldo = this.transferenciaService.saldoDisponible$.subscribe(saldo => {
      this.saldoDisponible.set(saldo);
    });

    // Re-evaluar formulario completo al cambiar el valor
    this.montoForm.get('monto')?.valueChanges.subscribe(() => {
      this.montoForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.subSaldo?.unsubscribe();
  }

  // Cambiar la cuenta de origen
  seleccionarCuenta(tipo: 'Débito' | 'Crédito'): void {
    this.cuentaSeleccionada.set(tipo);
    this.montoForm.updateValueAndValidity();
  }

  // Volver al paso anterior
  volver(): void {
    this.router.navigate(['/transferencia']);
  }

  // Continuar a la confirmación
  continuar(): void {
    if (this.montoForm.valid) {
      const monto = this.montoForm.getRawValue().monto;
      this.transferenciaService.establecerMonto(monto);
      this.transferenciaService.establecerCuentaOrigen(this.cuentaSeleccionada());
      this.router.navigate(['/confirmacion']);
    } else {
      this.montoForm.markAllAsTouched();
    }
  }

  // Helpers para mensajes de error
  get montoInvalido(): boolean {
    const control = this.montoForm.get('monto');
    return !!(control?.invalid && (control?.touched || control?.dirty)) || this.montoForm.hasError('fondosInsuficientes');
  }

  get errorText(): string {
    const control = this.montoForm.get('monto');
    if (control?.hasError('required')) {
      return 'El monto es requerido';
    }
    if (control?.hasError('min')) {
      return 'El monto mínimo a enviar es de $1.00';
    }
    if (this.montoForm.hasError('fondosInsuficientes')) {
      return 'Fondos insuficientes en tu cuenta de Débito';
    }
    return 'Ingresa un monto válido';
  }
}
