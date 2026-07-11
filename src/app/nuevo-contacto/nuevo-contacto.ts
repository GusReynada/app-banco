import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { TransferenciaService } from '../transferencia.service';

@Component({
  selector: 'app-nuevo-contacto',
  imports: [NgOptimizedImage, CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-contacto.html',
  styleUrl: './nuevo-contacto.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuevoContactoComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly transferenciaService = inject(TransferenciaService);

  // Marca del emisor de tarjeta
  protected readonly tarjetaEmisor = signal<'Visa' | 'Mastercard' | 'Otros'>('Otros');

  // Formulario reactivo con validador de longitud limpia de 16 caracteres
  protected readonly contactoForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    numeroCuenta: ['', [
      Validators.required,
      (control: AbstractControl) => {
        const val = control.value || '';
        const rawDigits = val.replace(/\D/g, '');
        return rawDigits.length === 16 ? null : { invalidDigits: true };
      }
    ]]
  });

  ngOnInit(): void {
    // Suscribirse a los cambios del control de cuenta para formatear con espacios en vivo
    this.contactoForm.get('numeroCuenta')?.valueChanges.subscribe(value => {
      if (!value) {
        this.tarjetaEmisor.set('Otros');
        return;
      }

      // 1. Limpiar caracteres no numéricos y limitar a 16 dígitos
      const digitosLimpios = value.replace(/\D/g, '').slice(0, 16);

      // 2. Detectar marca del banco emisor
      if (digitosLimpios.startsWith('4')) {
        this.tarjetaEmisor.set('Visa');
      } else if (digitosLimpios.startsWith('5')) {
        this.tarjetaEmisor.set('Mastercard');
      } else {
        this.tarjetaEmisor.set('Otros');
      }

      // 3. Formatear agrupando de 4 en 4
      const chunks = digitosLimpios.match(/.{1,4}/g);
      const formateado = chunks ? chunks.join(' ') : '';

      // 4. Actualizar input sin disparar eventos recursivos
      this.contactoForm.get('numeroCuenta')?.setValue(formateado, { emitEvent: false });
    });
  }

  volverATransferencia(): void {
    this.router.navigate(['/transferencia']);
  }

  guardarYContinuar(): void {
    if (this.contactoForm.valid) {
      const { nombre, numeroCuenta } = this.contactoForm.getRawValue();
      
      // Enviamos el número limpio sin espacios al servicio para consistencia
      const cuentaLimpia = numeroCuenta.replace(/\s+/g, '');
      this.transferenciaService.agregarContacto(nombre, cuentaLimpia);
      
      this.router.navigate(['/monto']);
    } else {
      this.contactoForm.markAllAsTouched();
    }
  }
}
