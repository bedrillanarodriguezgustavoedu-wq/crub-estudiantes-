import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoEstudiante, Estudiante, EstudianteInput } from '../models/estudiante.model';

@Component({
  selector: 'app-estudiante-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './estudiante-form.component.html',
  styleUrl: './estudiante-form.component.css',
})
export class EstudianteFormComponent implements OnInit {
  @Input() estudiante: Estudiante | null = null;
  @Input() saving = false;
  @Output() readonly submitted = new EventEmitter<EstudianteInput>();
  @Output() readonly cancelled = new EventEmitter<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    apellido: ['', [Validators.required, Validators.maxLength(60)]],
    edad: [6, [Validators.required, Validators.min(3), Validators.max(100)]],
    grado: ['', [Validators.required, Validators.maxLength(40)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    estado: ['Activo' as EstadoEstudiante],
  });

  get esEdicion(): boolean {
    return this.estudiante !== null;
  }

  ngOnInit(): void {
    if (!this.estudiante) {
      return;
    }

    const estudiante = this.estudiante;
    this.form.patchValue({
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      edad: estudiante.edad,
      grado: estudiante.grado,
      correo: estudiante.correo,
      estado: estudiante.estado,
    });
  }

  submit(): void {
    if (this.saving || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitted.emit({
      nombre: value.nombre.trim(),
      apellido: value.apellido.trim(),
      edad: value.edad,
      grado: value.grado.trim(),
      correo: value.correo.trim(),
      estado: value.estado,
      version: this.estudiante?.version ?? 0,
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.saving) {
      this.cerrar();
    }
  }

  cerrar(): void {
    if (!this.saving) {
      this.cancelled.emit();
    }
  }
}
