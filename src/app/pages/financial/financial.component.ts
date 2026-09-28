import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { Invoice } from '../../core/student-api.models';

/** The student's invoices and balance, as issued by the programme office. */
@Component({
  selector: 'sb-financial',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="page-header">
      <h1>Financial</h1>
    </div>

    @if (error) {
      <div class="card sa-card text-secondary">{{ error }}</div>
    } @else {
      <div class="tiles">
        <div class="card tile"><span class="l">Total invoiced</span><span class="v">€{{ totalInvoiced() | number: '1.2-2' }}</span></div>
        <div class="card tile"><span class="l">Paid</span><span class="v">€{{ paid() | number: '1.2-2' }}</span></div>
        <div class="card tile"><span class="l">Outstanding</span><span class="v">€{{ outstanding() | number: '1.2-2' }}</span></div>
      </div>

      <div class="card sa-card">
        <div class="card-head"><span class="card-title">Invoices</span></div>
        @if (invoices.length === 0) {
          <p class="text-muted">You have no invoices.</p>
        } @else {
          <table>
            <thead><tr><th>Invoice</th><th>Description</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              @for (i of invoices; track i.id) {
                <tr>
                  <td class="text-muted">{{ i.invoiceNumber }}</td>
                  <td>{{ i.description }}</td>
                  <td class="text-muted">{{ i.issueDate | date: 'MMM d, y' }}</td>
                  <td class="text-muted">{{ i.dueDate | date: 'MMM d, y' }}</td>
                  <td>€{{ i.amount | number: '1.2-2' }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="i.status === 'PAID'" [class.badge-warning]="i.status === 'PARTIAL'" [class.badge-danger]="i.status === 'UNPAID'">{{ i.status }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
        <p class="sa-hint" style="margin-top: 12px">Questions about a payment? Contact the programme office — payments are recorded by them.</p>
      </div>
    }
  `,
  styles: [
    `
      .tiles {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }
      .tile {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .l {
        font-size: 12.5px;
        color: var(--text-muted);
      }
      .v {
        font-size: 22px;
        font-weight: 500;
      }
      @media (max-width: 700px) {
        .tiles {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FinancialComponent implements OnInit {
  private api = inject(StudentApiService);

  invoices: Invoice[] = [];
  error: string | null = null;

  ngOnInit(): void {
    this.api.invoices().subscribe({
      next: (invoices) => (this.invoices = invoices),
      error: (err) => (this.error = studentApiError(err, 'Could not load your financial information.')),
    });
  }

  totalInvoiced(): number {
    return this.invoices.reduce((s, i) => s + i.amount, 0);
  }

  paid(): number {
    return this.invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  }

  outstanding(): number {
    return this.totalInvoiced() - this.paid();
  }
}
