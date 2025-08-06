import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';

const HistoryPage = ({ takenLog, calculateAnalytics, getStreakBadge, cardPaperProps }) => {
    // Convert log object to sorted array of {date, takenAt}
    const entries = Object.entries(takenLog)
        .map(([id, value]) => ({ id, takenAt: value.takenAt }))
        .sort((a, b) => a.id > b.id ? 1 : -1); // Ascending by date for chart
    const { streak, adherence, missed } = calculateAnalytics(takenLog);
    const badge = getStreakBadge(streak);
    // Prepare data for chart
    const chartData = entries.map(({ id, takenAt }) => ({
        date: id.slice(5), // MM-DD
        taken: takenAt ? 1 : 0,
        missed: takenAt ? 0 : 1
    }));
    // Calendar tile coloring
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const id = `${year}-${month}-${day}`;
            if (takenLog[id] && takenLog[id].takenAt) return 'calendar-taken';
            if (takenLog[id] && !takenLog[id].takenAt) return 'calendar-missed';
        }
        return null;
    };
    return (
        <Container maxWidth="sm">
            <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                    Full History
                </Typography>
                <Button component={Link} to="/" variant="outlined">Back to 7-Day Log</Button>
                {badge && (
                    <Box mt={2} display="flex" alignItems="center" justifyContent="center">
                        {badge.icon}
                        <Typography variant="h6" fontWeight={700} color="secondary.main">{badge.label}</Typography>
                    </Box>
                )}
            </Box>
            <Box mb={4}>
                <Calendar
                    tileClassName={tileClassName}
                    calendarType="US"
                />
                <style>{`
                    .calendar-taken {
                        background: #c8e6c9 !important;
                        color: #256029 !important;
                        border-radius: 50%;
                    }
                    .calendar-missed {
                        background: #ffcdd2 !important;
                        color: #b71c1c !important;
                        border-radius: 50%;
                    }
                `}</style>
            </Box>
            <Paper {...cardPaperProps} sx={{ mb: 4, p: 2 }}>
                <Typography variant="h6" fontWeight={600} mb={1}>Analytics</Typography>
                <Typography>Longest Streak: <b>{streak}</b> days</Typography>
                <Typography>Adherence: <b>{adherence}%</b></Typography>
                <Typography>Missed Doses: <b>{missed}</b></Typography>
            </Paper>
            <Paper {...cardPaperProps} sx={{ mb: 4, p: 2 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Intake Over Time</Typography>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                        <YAxis ticks={[0, 1]} domain={[0, 1]} allowDecimals={false} />
                        <Tooltip formatter={(value) => value ? 'Taken' : 'Missed'} />
                        <Bar dataKey="taken" fill="#4caf50" name="Taken" />
                        <Bar dataKey="missed" fill="#e57373" name="Missed" />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
            <Paper {...cardPaperProps}>
                {entries.length === 0 ? (
                    <Typography>No history found.</Typography>
                ) : (
                    entries.slice().reverse().map(({ id, takenAt }) => (
                        <Box key={id} display="flex" alignItems="center" justifyContent="space-between" py={2} borderBottom={1} borderColor="#ecf0f1">
                            <Typography variant="subtitle1">{id}</Typography>
                            {takenAt ? (
                                <Typography color="success.main" fontWeight={600}>Taken</Typography>
                            ) : (
                                <Typography color="error.main" fontWeight={600}>Missed</Typography>
                            )}
                        </Box>
                    ))
                )}
            </Paper>
        </Container>
    );
};

export default HistoryPage;
