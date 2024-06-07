import { Component, OnInit } from '@angular/core';
import { PresenceService } from './services/presence/presence-service.service';
import { Presence } from './models/Presence';
import { MatDialog } from '@angular/material/dialog';
import { CheckInComponent } from './components/check-in/check-in.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'fe';
  presences: Presence[] = [];

  constructor(
    private presenceService: PresenceService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.presenceService.getPresences().subscribe((data) => {
      this.presences = data;
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CheckInComponent, {
      width: '500px',
      height: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.presenceService.getPresences().subscribe((data) => {
        this.presences = data;
      });
    });
  }

  co(nik: string): void {
    this.presenceService.checkOut(nik).subscribe((data) => {
      this.presenceService.getPresences().subscribe((data) => {
        this.presences = data;
      });
    });
  }
}
