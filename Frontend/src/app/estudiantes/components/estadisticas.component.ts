import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Estadisticas } from '../models/estudiante.model';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  template: `
    @if (estadisticas; as stats) {
      <section class="stats" aria-label="Estadísticas del colegio">
        <article class="stat-card">
          <span class="stat-icon">👥</span>
          <div>
            <span class="stat-label">Total estudiantes</span>
            <strong class="stat-value">{{ stats.total }}</strong>
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-icon stat-icon-ok">✅</span>
          <div>
            <span class="stat-label">Activos</span>
            <strong class="stat-value">{{ stats.activos }}</strong>
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-icon stat-icon-warn">⏸️</span>
          <div>
            <span class="stat-label">Inactivos</span>
            <strong class="stat-value">{{ stats.inactivos }}</strong>
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-icon stat-icon-age">🎂</span>
          <div>
            <span class="stat-label">Edad promedio</span>
            <strong class="stat-value">{{ stats.edadPromedio | number: '1.1-1' }}</strong>
          </div>
        </article>
      </section>
    } @else if (loading) {
      <section class="stats" aria-label="Cargando estadísticas" aria-busy="true">
        @for (card of [1, 2, 3, 4]; track card) {
          <article class="stat-card stat-card-loading">
            <span class="stat-icon skeleton"></span>
            <div class="stat-placeholder">
              <span class="skeleton"></span>
              <span class="skeleton"></span>
            </div>
          </article>
        }
      </section>
    }
  `,
  styles: [
    `
      .stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 20px;
      }
      .stat-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      }
      .stat-icon {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: #eff6ff;
        font-size: 20px;
      }
      .stat-icon-ok { background: #ecfdf5; }
      .stat-icon-warn { background: #fff7ed; }
      .stat-icon-age { background: #f5f3ff; }
      .stat-label {
        display: block;
        color: #64748b;
        font-size: 12px;
      }
      .stat-value {
        display: block;
        font-size: 22px;
        color: #0f172a;
      }
      .stat-card-loading { pointer-events: none; }
      .stat-placeholder { flex: 1; display: grid; gap: 8px; }
      .skeleton {
        display: block;
        height: 12px;
        border-radius: 6px;
        background: linear-gradient(90deg, #eef2f7 25%, #f8fafc 50%, #eef2f7 75%);
        background-size: 200% 100%;
        animation: shimmer 1.4s ease-in-out infinite;
      }
      .stat-placeholder .skeleton:last-child { width: 52%; height: 19px; }
      .stat-icon.skeleton { width: 42px; height: 42px; }
      @keyframes shimmer {
        to { background-position: -200% 0; }
      }
      @media (max-width: 860px) {
        .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 480px) {
        .stats { grid-template-columns: 1fr; }
      }
    `,
  ],
  imports: [CommonModule],
})
export class EstadisticasComponent {
  @Input() estadisticas: Estadisticas | null = null;
  @Input() loading = false;
}
