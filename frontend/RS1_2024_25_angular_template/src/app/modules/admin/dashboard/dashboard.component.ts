import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DashboardAnalyticsService, DashboardAnalyticsResponse } from '../../../endpoints/dashboard-endpoints/dashboard.service';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  private updateInterval: any;
  analytics!: DashboardAnalyticsResponse;
  charts: { [key: string]: Chart } = {};
  loading = true;
  error: string | null = null;
  private dataLoaded = false;

  // Common chart options
  private commonChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  constructor(private dashboardService: DashboardAnalyticsService) {}

  ngOnInit() {
    this.loadAnalytics();
    this.startRealTimeUpdates();
  }

  ngAfterViewInit() {
    if (this.dataLoaded) {
      this.initializeCharts();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.destroyCharts();
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.dashboardService.handleAsync()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.analytics = data;
            this.updateCharts();
          },
          error: (error) => {
            console.error('Error updating dashboard data:', error);
          }
        });
    }, 30000);
  }

  loadAnalytics() {
    this.loading = true;
    this.error = null;

    this.dashboardService.handleAsync()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.analytics = data;
          this.loading = false;
          this.dataLoaded = true;
          setTimeout(() => this.initializeCharts(), 100);
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error = 'Failed to load dashboard data. Please try again later.';
          this.loading = false;
        }
      });
  }

  private destroyCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  private initializeCharts() {
    if (!this.analytics) return;

    this.destroyCharts();

    const chartElements = {
      userActivity: document.getElementById('userActivityChart'),
      advertisement: document.getElementById('advertisementChart'),
      manufacturers: document.getElementById('manufacturersChart'),
      fuelType: document.getElementById('fuelTypeChart'),
      transmission: document.getElementById('transmissionChart'),
      priceDistribution: document.getElementById('priceDistributionChart'),
      views: document.getElementById('viewsChart')
    };

    try {
      if (chartElements.advertisement) this.createAdvertisementChart();
      if (chartElements.manufacturers) this.createManufacturersChart();
      if (chartElements.fuelType) this.createFuelTypeChart();
      if (chartElements.transmission) this.createTransmissionChart();
      if (chartElements.priceDistribution) this.createPriceDistributionChart();
      if (chartElements.views) this.createViewsChart();
    } catch (error) {
      console.error('Error initializing charts:', error);
      this.error = 'Failed to initialize charts. Please refresh the page.';
    }
  }

  private updateCharts() {
    if (!this.analytics) return;

    Object.entries(this.charts).forEach(([chartId, chart]) => {
      try {
        switch (chartId) {
          case 'advertisement':
            chart.data.datasets[0].data = [
              this.analytics.advertStats.newAdvertisementsToday,
              this.analytics.advertStats.newAdvertisementsThisWeek,
              this.analytics.advertStats.newAdvertisementsThisMonth
            ];
            break;

          case 'manufacturers':
            const manufacturers = this.analytics.manufacturerStats.slice(0, 5);
            chart.data.labels = manufacturers.map(m => m.name);
            chart.data.datasets[0].data = manufacturers.map(m => m.totalCars);
            break;

          case 'fuelType':
            chart.data.labels = this.analytics.vehicleStats.byFuelType.map(ft => ft.type);
            chart.data.datasets[0].data = this.analytics.vehicleStats.byFuelType.map(ft => ft.count);
            break;

          case 'transmission':
            chart.data.labels = this.analytics.vehicleStats.byTransmission.map(t => t.type);
            chart.data.datasets[0].data = this.analytics.vehicleStats.byTransmission.map(t => t.count);
            break;

          case 'priceDistribution':
            const sortedData = [...this.analytics.priceRangeDistribution].sort((a, b) => {
              const getMinValue = (range: string) => {
                const value = range.split('-')[0].replace(/[€,\s]/g, '');
                return parseInt(value, 10);
              };
              return getMinValue(a.range) - getMinValue(b.range);
            });
            chart.data.labels = sortedData.map(p => `€${p.range}`);
            chart.data.datasets[0].data = sortedData.map(p => p.count);
            break;

          case 'views':
            const topViewed = this.analytics.viewStats.slice(0, 5);
            chart.data.labels = topViewed.map(v => v.title);
            chart.data.datasets[0].data = topViewed.map(v => v.viewCount);
            break;
        }

        chart.update('none');
      } catch (error) {
        console.error(`Error updating ${chartId} chart:`, error);
      }
    });
  }

  private createAdvertisementChart() {
    const ctx = document.getElementById('advertisementChart') as HTMLCanvasElement;
    this.charts['advertisement'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Today', 'This Week', 'This Month'],
        datasets: [{
          label: 'New Advertisements',
          data: [
            this.analytics.advertStats.newAdvertisementsToday,
            this.analytics.advertStats.newAdvertisementsThisWeek,
            this.analytics.advertStats.newAdvertisementsThisMonth
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Advertisement Growth'
          }
        },
        ...this.commonChartOptions
      }
    });
  }

  private createManufacturersChart() {
    const ctx = document.getElementById('manufacturersChart') as HTMLCanvasElement;
    const manufacturers = this.analytics.manufacturerStats.slice(0, 5); // Top 5 manufacturers

    this.charts['manufacturers'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: manufacturers.map(m => m.name),
        datasets: [{
          label: 'Total Cars',
          data: manufacturers.map(m => m.totalCars),
          backgroundColor: 'rgba(153, 102, 255, 0.5)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top Manufacturers'
          }
        },
        ...this.commonChartOptions
      }
    });
  }

  private createFuelTypeChart() {
    const ctx = document.getElementById('fuelTypeChart') as HTMLCanvasElement;
    this.charts['fuelType'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.analytics.vehicleStats.byFuelType.map(ft => ft.type),
        datasets: [{
          data: this.analytics.vehicleStats.byFuelType.map(ft => ft.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Fuel Type Distribution'
          }
        },
        ...this.commonChartOptions
      }
    });
  }

  private createTransmissionChart() {
    const ctx = document.getElementById('transmissionChart') as HTMLCanvasElement;
    this.charts['transmission'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.analytics.vehicleStats.byTransmission.map(t => t.type),
        datasets: [{
          data: this.analytics.vehicleStats.byTransmission.map(t => t.count),
          backgroundColor: [
            'rgba(255, 159, 64, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Transmission Types'
          }
        },
        ...this.commonChartOptions
      }
    });
  }

  private createPriceDistributionChart() {
    const ctx = document.getElementById('priceDistributionChart') as HTMLCanvasElement;

    // Sort price ranges
    const sortedData = [...this.analytics.priceRangeDistribution].sort((a, b) => {
      // Extract the lower bound of the range and convert to number
      const getMinValue = (range: string) => {
        const value = range.split('-')[0].replace(/[€,\s]/g, '');
        return parseInt(value, 10);
      };
      return getMinValue(a.range) - getMinValue(b.range);
    });

    this.charts['priceDistribution'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedData.map(p => `€${p.range}`),
        datasets: [{
          label: 'Number of Vehicles',
          data: sortedData.map(p => p.count),
          backgroundColor: 'rgba(255, 106, 0, 0.7)',
          borderRadius: 4
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: false,
              text: 'Number of Vehicles'
            }
          },
          x: {
            title: {
              display: false,
              text: 'Price Range (EUR)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Vehicles by Price Range'
          }
        },
        ...this.commonChartOptions
      }
    });
  }

  private createViewsChart() {
    const ctx = document.getElementById('viewsChart') as HTMLCanvasElement;
    const topViewed = this.analytics.viewStats.slice(0, 5); // Top 5 viewed ads

    this.charts['views'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topViewed.map(v => v.title),
        datasets: [{
          label: 'Views',
          data: topViewed.map(v => v.viewCount),
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text: 'Most Viewed Advertisements'
          }
        },
        ...this.commonChartOptions
      }
    });
  }

  get advertGrowthRate(): number {
    if (!this.analytics?.advertStats) return 0;
    const { totalAdvertisements, newAdvertisementsThisMonth } = this.analytics.advertStats;
    return totalAdvertisements > 0 ? (newAdvertisementsThisMonth / totalAdvertisements) * 100 : 0;
  }

  refreshData(): void {
    this.loadAnalytics();
  }
}
