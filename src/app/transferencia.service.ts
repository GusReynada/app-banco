import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Contacto {
  id: number;
  nombre: string;
  digitos: string;
  imagen: string;
  frecuente: boolean;
}

export interface TransferenciaEstado {
  contacto: Contacto | null;
  cuentaOrigen: 'Débito' | 'Crédito' | null;
  monto: number | null;
}

export interface Movimiento {
  id: number;
  fecha: Date;
  concepto: string;
  monto: number;
  tipoCuenta: 'Débito' | 'Crédito';
  logo: string;
  tipo: 'ingreso' | 'egreso';
  folio: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {
  // Lista inicial de contactos
  private readonly contactosIniciales: Contacto[] = [
    {
      id: 1,
      nombre: 'Gustavo R',
      digitos: '5543210987654321',
      imagen: 'img/icon_ContactosFrecuentes.png',
      frecuente: true
    },
    {
      id: 2,
      nombre: 'Francisco J',
      digitos: '4321876509123456',
      imagen: 'img/icon_ContactosFrecuentes.png',
      frecuente: true
    },
    {
      id: 3,
      nombre: 'Pedro Jimenez',
      digitos: '4915783920114567',
      imagen: 'img/icon_PedroJimenez.png',
      frecuente: false
    },
    {
      id: 4,
      nombre: 'Nohemi Morales',
      digitos: '4915284493017721',
      imagen: 'img/icon_NohemiMorales.png',
      frecuente: false
    },
    {
      id: 5,
      nombre: 'Canelo Alvarez',
      digitos: '4915901234567890',
      imagen: 'img/icon_CaneloAlvarez.png',
      frecuente: false
    }
  ];

  // Estado de Autenticación
  private readonly autenticadoSubject = new BehaviorSubject<boolean>(false);
  readonly autenticado$ = this.autenticadoSubject.asObservable();

  // Saldo Disponible inicial
  private readonly saldoSubject = new BehaviorSubject<number>(15234.50);
  readonly saldoDisponible$ = this.saldoSubject.asObservable();

  // Historial de Movimientos Inicial
  private readonly movimientosIniciales: Movimiento[] = [
    {
      id: 1,
      fecha: new Date(new Date().setDate(new Date().getDate() - 3)),
      concepto: 'Supermercado Soriana',
      monto: 1250.80,
      tipoCuenta: 'Débito',
      logo: 'img/icon_MisTarjetas.png',
      tipo: 'egreso',
      folio: 4829104
    },
    {
      id: 2,
      fecha: new Date(new Date().setDate(new Date().getDate() - 2)),
      concepto: 'Abono Nómina Quincena',
      monto: 8500.00,
      tipoCuenta: 'Débito',
      logo: 'img/icon_Account.png',
      tipo: 'ingreso',
      folio: 9381023
    },
    {
      id: 3,
      fecha: new Date(new Date().setDate(new Date().getDate() - 1)),
      concepto: 'Suscripción Netflix Premium',
      monto: 229.00,
      tipoCuenta: 'Crédito',
      logo: 'img/icon_MisTarjetas.png',
      tipo: 'egreso',
      folio: 1049281
    }
  ];

  private readonly movimientosSubject = new BehaviorSubject<Movimiento[]>(this.movimientosIniciales);
  readonly movimientos$ = this.movimientosSubject.asObservable();

  // Contactos
  private readonly contactosSubject = new BehaviorSubject<Contacto[]>(this.contactosIniciales);
  readonly contactos$ = this.contactosSubject.asObservable();

  // Estado de la transferencia actual
  private readonly estadoInicial: TransferenciaEstado = {
    contacto: null,
    cuentaOrigen: null,
    monto: null
  };

  private readonly estadoSubject = new BehaviorSubject<TransferenciaEstado>(this.estadoInicial);
  readonly estado$ = this.estadoSubject.asObservable();

  constructor() {}

  // Autenticación
  isAutenticado(): boolean {
    return this.autenticadoSubject.getValue();
  }

  iniciarSesion(pin: string): boolean {
    if (pin === '1234') {
      this.autenticadoSubject.next(true);
      return true;
    }
    return false;
  }

  cerrarSesion(): void {
    this.autenticadoSubject.next(false);
  }

  // Saldo
  getSaldo(): number {
    return this.saldoSubject.getValue();
  }

  // Movimientos
  getMovimientos(): Movimiento[] {
    return this.movimientosSubject.getValue();
  }

  // Obtener lista actual de contactos
  getContactos(): Contacto[] {
    return this.contactosSubject.getValue();
  }

  // Obtener estado actual de la transferencia
  getEstado(): TransferenciaEstado {
    return this.estadoSubject.getValue();
  }

  // Seleccionar contacto destinatario
  seleccionarContacto(contacto: Contacto | null): void {
    const estadoActual = this.getEstado();
    this.estadoSubject.next({
      ...estadoActual,
      contacto
    });
  }

  // Establecer cuenta origen (Débito / Crédito)
  establecerCuentaOrigen(cuentaOrigen: 'Débito' | 'Crédito' | null): void {
    const estadoActual = this.getEstado();
    this.estadoSubject.next({
      ...estadoActual,
      cuentaOrigen
    });
  }

  // Establecer monto de transferencia
  establecerMonto(monto: number | null): void {
    const estadoActual = this.getEstado();
    this.estadoSubject.next({
      ...estadoActual,
      monto
    });
  }

  // Ejecutar y guardar la transferencia en el balance e historial
  consumarTransferencia(folioGenerado: number): void {
    const estado = this.getEstado();
    if (estado.contacto && estado.monto && estado.cuentaOrigen) {
      // 1. Restar del saldo disponible
      const nuevoSaldo = this.getSaldo() - estado.monto;
      this.saldoSubject.next(nuevoSaldo);

      // 2. Crear y añadir el movimiento al feed
      const nuevoMovimiento: Movimiento = {
        id: this.getMovimientos().length + 1,
        fecha: new Date(),
        concepto: `Transferencia a ${estado.contacto.nombre}`,
        monto: estado.monto,
        tipoCuenta: estado.cuentaOrigen,
        logo: 'img/icon_Transferir.png',
        tipo: 'egreso',
        folio: folioGenerado
      };
      
      this.movimientosSubject.next([nuevoMovimiento, ...this.getMovimientos()]);
    }
  }

  // Agregar nuevo contacto dinámicamente
  agregarContacto(nombre: string, digitos: string): Contacto {
    const contactosActuales = this.getContactos();
    const nuevoId = contactosActuales.length > 0 ? Math.max(...contactosActuales.map(c => c.id)) + 1 : 1;
    
    const nuevoContacto: Contacto = {
      id: nuevoId,
      nombre,
      digitosHex: digitos, // save raw digits
      // Standardize formatting
      digitos: digitos.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim(),
      imagen: 'img/icon_Account.png', // Imagen genérica para nuevos contactos
      frecuente: false
    } as any;

    // fix typescript warnings if properties are strict
    Object.assign(nuevoContacto, { digitos: digitos.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim() });

    this.contactosSubject.next([...contactosActuales, nuevoContacto]);
    
    // Al añadir un contacto, se preselecciona automáticamente en el flujo
    this.seleccionarContacto(nuevoContacto);
    
    return nuevoContacto;
  }

  // Eliminar un contacto de forma reactiva
  eliminarContacto(id: number): void {
    const contactosActuales = this.getContactos();
    const nuevosContactos = contactosActuales.filter(c => c.id !== id);
    this.contactosSubject.next(nuevosContactos);

    // Si el contacto eliminado era el seleccionado, lo deseleccionamos
    const estadoActual = this.getEstado();
    if (estadoActual.contacto && estadoActual.contacto.id === id) {
      this.seleccionarContacto(null);
    }
  }

  // Limpiar/Reiniciar todo el estado de la transferencia
  limpiarTransferencia(): void {
    this.estadoSubject.next({ ...this.estadoInicial });
  }
}
