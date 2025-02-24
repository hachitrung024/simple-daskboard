// Temperature Chart
const tempChartCtx = document.getElementById('tempChart').getContext('2d');
const tempChart = new Chart(tempChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Temperature',
                data: [],
                borderColor: 'red',
                tension: 0.3,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        animation:false,
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true, 
                    color: 'red',
                    pointStyle: 'none',
                    boxWidth: 0,
                    boxHeight: 0,
                    font: {
                        weight: 'bold',
                        size: 20 
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

// Humidity Chart
const humidChartCtx = document.getElementById('humidChart').getContext('2d');
const humidChart = new Chart(humidChartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Humidity',
                data: [],
                borderColor: 'blue',
                tension: 0.3,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        animation:false,
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true, 
                    color: 'blue',
                    pointStyle: 'none',
                    boxWidth: 0,
                    boxHeight: 0,
                    font: {
                        weight: 'bold',
                        size: 20 
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

// Gauge Chart Configurations
function createGauge(ctx, value, max, color) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: [value, max - value],
                    backgroundColor: [color, '#eaeaea'],
                    borderWidth: 0
                }
            ]
        },
        options: {
            rotation: -90,
            circumference: 180,
            cutout: '80%',
            plugins: {
                tooltip: { enabled: false },
                legend: { display: false }
            }
        }
    });
}

// Gauges
const tempGauge = createGauge(
    document.getElementById('gaugeTemp').getContext('2d'),
    0, 100, 'red'
);

const humidityGauge = createGauge(
    document.getElementById('gaugeHumidity').getContext('2d'),
    0, 100, 'blue'
);
const chartCycleGauge = createGauge(
    document.getElementById('gaugeChartCycle').getContext('2d'),
    0, 20, 'green'
);

const gaugeCycleGauge = createGauge(
    document.getElementById('gaugeGaugeCycle').getContext('2d'),
    0, 20, 'yellow'
);
const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJoYWNoaXRydW5nMDI0QGdtYWlsLmNvbSIsInVzZXJJZCI6Ijc4MTNiNmEwLWUxZGItMTFlZi1hZDA5LTUxNWY3OTBlZDlkZiIsInNjb3BlcyI6WyJURU5BTlRfQURNSU4iXSwic2Vzc2lvbklkIjoiZTRiZjM4YjQtNjJjYS00MDA1LTlhMjEtZjNmZjZmMGU5Mjc4IiwiZXhwIjoxNzQwMzk4ODc5LCJpc3MiOiJjb3JlaW90LmlvIiwiaWF0IjoxNzQwMzg5ODc5LCJmaXJzdE5hbWUiOiJUcnVuZyBIYSIsImVuYWJsZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwidGVuYW50SWQiOiI3ODA5MDg0MC1lMWRiLTExZWYtYWQwOS01MTVmNzkwZWQ5ZGYiLCJjdXN0b21lcklkIjoiMTM4MTQwMDAtMWRkMi0xMWIyLTgwODAtODA4MDgwODA4MDgwIn0.RN-pY9J0QzOj9esFaLGEEJTY1ONVBwdKuDMOz3Z6Fn6HMDvDwngBvuNiuciAJAp3Gl9UiMzdk_zH3uq50o1cXA";
const deviceId = "806aaae0-ef49-11ef-87b5-21bccf7d29d5";
const url = `https://app.coreiot.io/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=temp,humi`;

async function updateChartData(chart) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        const tempValue = data.temp?.[0]?.value ? parseFloat(data.temp[0].value).toFixed(2) : null;
        const humiValue = data.humi?.[0]?.value ? parseFloat(data.humi[0].value).toFixed(2) : null;

        if (tempValue === null || humiValue === null) {
            console.warn("Invalid data received:", data);
            return;
        }
        const currentTime = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23'
        }).format(new Date());

        tempChart.data.datasets[0].data.push(tempValue);
        tempChart.data.labels.push(currentTime);
        if (tempChart.data.datasets[0].data.length > 60) {
            tempChart.data.datasets[0].data.shift();
            tempChart.data.labels.shift();
        }
        tempChart.update();

        humidChart.data.datasets[0].data.push(humiValue);
        humidChart.data.labels.push(currentTime);
        if (humidChart.data.datasets[0].data.length > 60) {
            humidChart.data.datasets[0].data.shift();
            humidChart.data.labels.shift();
        }
        humidChart.update();
        
    } catch (error) {
        console.error('Error updating chart data:', error);
    }
}
async function updateGauge() {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        const tempValue = data.temp?.[0]?.value ? parseFloat(data.temp[0].value).toFixed(2) : null;
        const humiValue = data.humi?.[0]?.value ? parseFloat(data.humi[0].value).toFixed(2) : null;

        if (tempValue === null || humiValue === null) {
            console.warn("Invalid data received:", data);
            return;
        }

        document.getElementById('tempValue').innerText = `${tempValue}°C`;
        document.getElementById('humidityValue').innerText = `${humiValue}%`;

        tempColor = setTemperatureColor(tempValue);
        tempGauge.data.datasets[0].data[0] = tempValue;
        tempGauge.data.datasets[0].data[1] = 40 - tempValue;
        tempGauge.data.datasets[0].backgroundColor[0] = `rgb(${tempColor.red}, ${tempColor.green}, ${tempColor.blue})`;
        tempGauge.update();

        humiColor = setTemperatureColor(humiValue);
        humidityGauge.data.datasets[0].data[0] = humiValue;
        humidityGauge.data.datasets[0].data[1] = 100 - humiValue;
        humidityGauge.data.datasets[0].backgroundColor[0] = `rgb(${humiColor.red}, ${humiColor.green}, ${humiColor.blue})`;
        humidityGauge.update();

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
const frequencyOptions = [1000, 2000, 5000, 10000, 20000];
let chartFrequencyIndex = 2;
let gaugeFrequencyIndex = 0; 
let chartInterval = null;
let gaugeInterval = null;

function toggleChartFrequency() {
    chartFrequencyIndex = (chartFrequencyIndex + 1) % frequencyOptions.length;
    const newFrequency = frequencyOptions[chartFrequencyIndex];

    document.getElementById('chartCycle').innerText = `${newFrequency / 1000}s`;
    chartCycleGauge.data.datasets[0].data[0] = newFrequency / 1000;
    chartCycleGauge.data.datasets[0].data[1] = 20 - (newFrequency / 1000);
    chartCycleGauge.update();
    if (chartInterval) clearInterval(chartInterval);
    chartInterval = setInterval(updateChartData, newFrequency);
}

function toggleGaugeFrequency() {
    gaugeFrequencyIndex = (gaugeFrequencyIndex + 1) % frequencyOptions.length;
    const newFrequency = frequencyOptions[gaugeFrequencyIndex];

    document.getElementById('gaugeCycle').innerText = `${newFrequency / 1000}s`;
    gaugeCycleGauge.data.datasets[0].data[0] = newFrequency/ 1000;
    gaugeCycleGauge.data.datasets[0].data[1] = 20 - (newFrequency/1000);
    gaugeCycleGauge.update();
    if (gaugeInterval) clearInterval(gaugeInterval);
    gaugeInterval = setInterval(updateGauge, newFrequency);
}

window.onload = function () {
    chartInterval= setInterval(updateChartData, frequencyOptions[chartFrequencyIndex]);
    gaugeInterval= setInterval(updateGauge, frequencyOptions[gaugeFrequencyIndex]);
    updateChartData();
    updateGauge();
    toggleChartFrequency();
    toggleGaugeFrequency();
};
function interpolateColor(startValue, endValue, currentValue, startRed, startGreen, startBlue, endRed, endGreen, endBlue) {
    const factor = (currentValue - startValue) / (endValue - startValue);
    const red = Math.round(startRed + factor * (endRed - startRed));
    const green = Math.round(startGreen + factor * (endGreen - startGreen));
    const blue = Math.round(startBlue + factor * (endBlue - startBlue));
    return { red, green, blue };
}

function setTemperatureColor(temperature) {
    if (temperature < 30 && temperature > 20) {
        return interpolateColor(20, 30, temperature, 0, 0, 255, 0, 0, 128);
    } else if (temperature >= 30 && temperature < 35) {
        return interpolateColor(30, 35, temperature, 255, 255, 0, 255, 128, 0);
    } else if (temperature >= 35 && temperature <= 40) {
        return interpolateColor(35, 40, temperature, 255, 128, 0, 255, 0, 0);
    } else if (temperature > 40) {
        return { red: 255, green: 0, blue: 0 };
    } else {
        return { red: 0, green: 0, blue: 0 };
    }
}
function setHumidityColor(humidity) {
    if (humidity < 50) {
        return interpolateColor(0, 50, humidity, 255, 0, 0, 255, 255, 0);
    } else if (humidity >= 50 && humidity < 70) {
        return interpolateColor(50, 70, humidity, 0, 255, 0, 0, 0, 255);
    } else if (humidity >= 70 && humidity < 80) {
        return interpolateColor(70, 80, humidity, 255, 255, 0, 255, 128, 0);
    } else if (humidity >= 80 && humidity < 90) {
        return interpolateColor(80, 90, humidity, 255, 128, 0, 255, 0, 0);
    } else if (humidity >= 90 && humidity <= 100) {
        return { red: 255, green: 0, blue: 0 };
    } else {
        return { red: 0, green: 0, blue: 0 };
    }
}
