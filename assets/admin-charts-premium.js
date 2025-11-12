// Admin Charts Module
// Handles Chart.js integration and data visualization

class AdminCharts {
    constructor() {
        this.revenueChart = null;
        this.servicesChart = null;
        this.currentPeriod = '7d';
    }

    // Initialize all charts
    init() {
        this.initializeRevenueChart();
        this.initializeServicesChart();
        console.log('Admin charts initialized');
    }

    // Initialize revenue trend chart
    initializeRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        // Generate sample revenue data
        const revenueData = this.generateRevenueData(this.currentPeriod);

        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: revenueData.labels,
                datasets: [{
                    label: 'Revenue',
                    data: revenueData.values,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return 'Revenue: ₹' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + (value / 1000) + 'K';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    // Initialize services breakdown chart
    initializeServicesChart() {
        const ctx = document.getElementById('servicesChart');
        if (!ctx) return;

        const servicesData = {
            labels: ['Wash & Fold', 'Dry Cleaning', 'Ironing', 'Express Service', 'Others'],
            values: [45, 25, 15, 10, 5]
        };

        this.servicesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: servicesData.labels,
                datasets: [{
                    data: servicesData.values,
                    backgroundColor: [
                        'rgb(59, 130, 246)',    // Blue
                        'rgb(16, 185, 129)',    // Green
                        'rgb(245, 158, 11)',    // Yellow
                        'rgb(239, 68, 68)',     // Red
                        'rgb(147, 51, 234)'     // Purple
                    ],
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBorderWidth: 3,
                    hoverOffset: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + percentage + '%';
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    // Generate revenue data based on period
    generateRevenueData(period) {
        let labels = [];
        let values = [];
        const today = new Date();

        switch (period) {
            case '7d':
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                    // Generate realistic revenue data (20K to 70K range)
                    values.push(Math.floor(Math.random() * 50000) + 20000);
                }
                break;

            case '30d':
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    if (i % 3 === 0) { // Show every 3rd day to avoid crowding
                        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                        values.push(Math.floor(Math.random() * 80000) + 30000);
                    }
                }
                break;

            case '90d':
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(today);
                    date.setMonth(date.getMonth() - i);
                    labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
                    // Weekly aggregated data
                    values.push(Math.floor(Math.random() * 300000) + 200000);
                }
                break;

            default:
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                values = [32000, 45000, 38000, 52000, 61000, 48000, 45280];
        }

        return { labels, values };
    }

    // Update chart period
    setChartPeriod(period) {
        this.currentPeriod = period;
        
        // Update active filter button
        document.querySelectorAll('.chart-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Find and activate the clicked button
        const activeBtn = document.querySelector(`[onclick*="'${period}'"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update chart data
        if (this.revenueChart) {
            const newData = this.generateRevenueData(period);
            this.revenueChart.data.labels = newData.labels;
            this.revenueChart.data.datasets[0].data = newData.values;
            this.revenueChart.update('active');
        }

        console.log('Chart period updated to:', period);
    }

    // Destroy charts (cleanup)
    destroy() {
        if (this.revenueChart) {
            this.revenueChart.destroy();
            this.revenueChart = null;
        }
        
        if (this.servicesChart) {
            this.servicesChart.destroy();
            this.servicesChart = null;
        }
    }

    // Refresh all charts
    refresh() {
        if (this.revenueChart) {
            const newData = this.generateRevenueData(this.currentPeriod);
            this.revenueChart.data.labels = newData.labels;
            this.revenueChart.data.datasets[0].data = newData.values;
            this.revenueChart.update();
        }

        console.log('Charts refreshed');
    }

    // Export chart as image
    exportChart(chartName) {
        let chart;
        let filename;

        switch (chartName) {
            case 'revenue':
                chart = this.revenueChart;
                filename = `revenue-chart-${this.currentPeriod}-${new Date().toISOString().split('T')[0]}.png`;
                break;
            case 'services':
                chart = this.servicesChart;
                filename = `services-chart-${new Date().toISOString().split('T')[0]}.png`;
                break;
            default:
                console.error('Unknown chart name:', chartName);
                return;
        }

        if (!chart) {
            console.error('Chart not found:', chartName);
            return;
        }

        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = chart.toBase64Image();
        link.click();

        console.log('Chart exported:', filename);
    }
}

// Initialize charts system
const adminCharts = new AdminCharts();

// Initialize on DOM ready (after Chart.js is loaded)
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure Chart.js is fully loaded
    setTimeout(() => {
        adminCharts.init();
    }, 100);
});

// Global functions
window.setChartPeriod = (period) => adminCharts.setChartPeriod(period);
window.exportChart = (chartName) => adminCharts.exportChart(chartName);