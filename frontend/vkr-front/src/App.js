import React, { useState } from 'react';
import axios from 'axios';
import { TextField, TextareaAutosize, Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const forecastColor = 'pink';
  const dataColor = 'lightgreen';
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [ticker, setTicker] = useState('');
  const [data, setData] = useState([]);
  const [N, setN] = useState(5);
  const [lastValue, setLastValue] = useState(0);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);


  const fetchData = () => {
    axios.post('http://localhost:8000/forecast/', { title, text, ticker })
      .then(response => {
        setData(response.data.numbers);
        setN(response.data.forecastedCount);
        setLastValue(response.data.lastValue);
      })
      .catch(error => {
        console.error('Error getting forecast:', error);
        setError(error.response.data.error);
        setOpenSnackbar(true); 
      });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const dataForChart = {
    labels: Array.from({ length: data.length }, (_, i) => i + 1),
    datasets: [
      {
        data: data,
        fill: false,
        backgroundColor: data.map((_, index) => index >= data.length - N ? forecastColor : dataColor),
        segment: {
          borderColor: (ctx) => {
            const index = ctx.p0DataIndex;
            return index >= data.length - N - 1 ? forecastColor : dataColor;
          }
        }
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
          generateLabels: (chart) => {
            const labels = [
              { text: 'Исторические данные', color: dataColor },
              { text: 'Прогнозируемые данные', color: forecastColor }
            ];
            return labels.map(label => ({
              text: label.text,
              fillStyle: label.color,
              lineCap: 'butt',
              lineDash: [],
              lineDashOffset: 0,
              lineJoin: 'miter',
              lineWidth: 2,
              strokeStyle: label.color,
              pointStyle: 'rectRounded',
              hidden: false,
              datasetIndex: 0
            }));
          }
        },
        onClick: (e, legendItem, legend) => {}
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Typography variant="h3" align="center" style={{ width: '100%', marginBottom: 30, }}>
        Прогнозирование стоимости акций
      </Typography>
      <TextField 
        label="Заголовок"
        variant="outlined" 
        placeholder="Перестановки в Газпроме"
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        style={{ marginBottom: 20 }}
      />
      <TextField
        minRows={3}
        label="Текст новости"
        placeholder="Глава газпрома ..."
        style={{ marginBottom: 20 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <TextField 
        label="Тикер компании" 
        variant="outlined" 
        placeholder="GAZP"
        value={ticker} 
        onChange={(e) => setTicker(e.target.value.toUpperCase())} 
        style={{ marginBottom: 20 }}
      />
      <Button type="submit" variant="contained" color="primary" onClick={fetchData}>
        Рассчитать прогноз
      </Button>
      <Box width="60%" height="400px" marginTop="20px">
        <Line data={dataForChart} options={options} />
      </Box>
      <Typography variant="body2" style={{ marginTop: 20 }}>
        © 2024 Все права защищены. Дреньков Тимофей. НИТУ "МИСиС"
      </Typography>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
