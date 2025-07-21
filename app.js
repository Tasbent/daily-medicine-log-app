import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { db } from './firebase';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
// Material UI imports
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LinearProgress from '@mui/material/LinearProgress';
// MUI X Date Pickers
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import useSound from 'use-sound';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Grid from '@mui/material/Grid';

// --- Helper Function to get the last 7 dates ---
const getLast7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push({ date: d, id: `${year}-${month}-${day}` });
    }
    return dates;
};

const getStreakBadge = (streak) => {
    if (streak >= 30) {
        return { icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 40, mr: 1 }} />, label: '30 Day Streak!' };
    } else if (streak >= 7) {
        return { icon: <StarIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />, label: '7 Day Streak!' };
    } else if (streak >= 3) {
        return { icon: <StarIcon color="success" sx={{ fontSize: 32, mr: 1 }} />, label: '3 Day Streak!' };
    }
    return null;
};

const STREAK_MILESTONES = [3, 7, 30];

const MOTIVATIONAL_MESSAGES = [
    "Great job! Keep up the healthy habit!",
    "You're building a strong routine!",
    "Every day counts. Well done!",
    "Your future self thanks you!",
    "Consistency is key. Nice work!",
    "You're on a roll!",
    "Small steps, big results!",
    "Proud of you for taking care of yourself!",
    "Another day, another win!",
    "Keep going, you're doing amazing!"
];

const getPetForStreak = (streak) => {
    if (streak >= 30) return { emoji: '🌳', label: 'Mighty Tree' };
    if (streak >= 7) return { emoji: '🌱', label: 'Sprouting Plant' };
    if (streak >= 3) return { emoji: '🌵', label: 'Cactus Buddy' };
    return { emoji: '🌰', label: 'Seedling' };
};

const cardPaperProps = {
    elevation: 3,
    sx: { p: 3, mb: 4, borderRadius: 3, boxShadow: 3, width: '100%' }
};

const ReminderSettings = () => {
    const [reminderEnabled, setReminderEnabled] = useState(false);
    // Store time as a Date object for TimePicker
    const [reminderTime, setReminderTime] = useState(() => {
        const savedTime = localStorage.getItem('reminderTime') || '08:00';
        const [h, m] = savedTime.split(':');
        const d = new Date();
        d.setHours(Number(h), Number(m), 0, 0);
        return d;
    });
    const [notifPermission, setNotifPermission] = useState(Notification?.permission || 'default');
    const [permissionRequested, setPermissionRequested] = useState(false);

    useEffect(() => {
        const savedEnabled = localStorage.getItem('reminderEnabled');
        if (savedEnabled !== null) setReminderEnabled(savedEnabled === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('reminderEnabled', reminderEnabled);
        // Save time as HH:mm string
        const h = String(reminderTime.getHours()).padStart(2, '0');
        const m = String(reminderTime.getMinutes()).padStart(2, '0');
        localStorage.setItem('reminderTime', `${h}:${m}`);
    }, [reminderEnabled, reminderTime]);

    useEffect(() => {
        if (reminderEnabled && notifPermission !== 'granted' && !permissionRequested) {
            if (Notification && Notification.requestPermission) {
                setPermissionRequested(true);
                Notification.requestPermission().then(permission => {
                    setNotifPermission(permission);
                    setPermissionRequested(false);
                });
            }
        }
    }, [reminderEnabled, notifPermission, permissionRequested]);

    const handleEnableChange = (e) => {
        setReminderEnabled(e.target.checked);
    };

    const handleTimeChange = (newValue) => {
        if (newValue) setReminderTime(newValue);
    };

    const requestPermission = () => {
        if (Notification && Notification.requestPermission) {
            Notification.requestPermission().then(setNotifPermission);
        }
    };

    let statusText = '';
    let statusColor = '';
    if (notifPermission === 'denied') {
        statusText = 'Notifications permission denied';
        statusColor = '#e74c3c';
    } else if (reminderEnabled && notifPermission === 'granted') {
        const h = String(reminderTime.getHours()).padStart(2, '0');
        const m = String(reminderTime.getMinutes()).padStart(2, '0');
        statusText = `Enabled at ${h}:${m}`;
        statusColor = '#1976d2';
    } else if (reminderEnabled && notifPermission !== 'granted') {
        statusText = 'Waiting for notification permission...';
        statusColor = '#e67e22';
    } else {
        statusText = 'Disabled';
        statusColor = '#7f8c8d';
    }

    return (
        <Paper {...cardPaperProps}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <NotificationsActiveIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Daily Reminder</Typography>
            </Stack>
            <FormControlLabel
                control={<Checkbox checked={reminderEnabled} onChange={handleEnableChange} color="primary" />}
                label="Enable Reminder"
            />
            <Box mt={2} mb={2}>
                <TextField
                    label="Reminder Time"
                    type="time"
                    value={(() => {
                        const h = String(reminderTime.getHours()).padStart(2, '0');
                        const m = String(reminderTime.getMinutes()).padStart(2, '0');
                        return `${h}:${m}`;
                    })()}
                    onChange={e => {
                        const [h, m] = e.target.value.split(':');
                        const d = new Date(reminderTime);
                        d.setHours(Number(h), Number(m), 0, 0);
                        setReminderTime(d);
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 60 }}
                    fullWidth
                    size="small"
                    disabled={!reminderEnabled}
                />
            </Box>
            {notifPermission !== 'granted' && (
                <Box mb={2}>
                    <Button onClick={requestPermission} variant="outlined" color="warning" size="small">
                        Allow Notifications
                    </Button>
                    <Typography variant="body2" color="warning.main" sx={{ ml: 2, display: 'inline' }}>
                        Notifications {notifPermission === 'denied' ? 'Denied' : 'Not Granted'}
                    </Typography>
                </Box>
            )}
            <Typography variant="body2" sx={{ color: statusColor, fontWeight: 500 }}>
                Status: {statusText}
            </Typography>
        </Paper>
    );
};

const calculateAnalytics = (takenLog) => {
    // Get all date strings and sort ascending
    const allDates = Object.keys(takenLog).sort();
    if (allDates.length === 0) return { streak: 0, adherence: 0, missed: 0 };
    let streak = 0, maxStreak = 0, missed = 0, taken = 0;
    let prevDate = null, currentStreak = 0;
    allDates.forEach(dateStr => {
        const isTaken = !!takenLog[dateStr].takenAt;
        if (isTaken) taken++;
        else missed++;
        // Streak calculation
        const [year, month, day] = dateStr.split('-').map(Number);
        const thisDate = new Date(year, month - 1, day);
        if (prevDate) {
            const diff = (thisDate - prevDate) / (1000 * 60 * 60 * 24);
            if (diff === 1 && isTaken) {
                currentStreak++;
            } else if (isTaken) {
                currentStreak = 1;
            } else {
                currentStreak = 0;
            }
        } else {
            currentStreak = isTaken ? 1 : 0;
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        prevDate = thisDate;
    });
    const adherence = allDates.length ? Math.round((taken / allDates.length) * 100) : 0;
    return { streak: maxStreak, adherence, missed };
};

function getCurrentMonthProgress(takenLog) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
    let taken = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const id = `${year}-${month}-${dayStr}`;
        if (takenLog[id] && takenLog[id].takenAt) taken++;
    }
    return { taken, daysInMonth, percent: Math.round((taken / daysInMonth) * 100) };
}

const HistoryPage = ({ takenLog }) => {
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

const THEMES = [
    { name: 'Default', bg: '#f4f7f9', primary: '#1976d2' },
    { name: 'Sunset', bg: '#fff3e0', primary: '#ff7043' },
    { name: 'Mint', bg: '#e0f2f1', primary: '#009688' },
    { name: 'Lavender', bg: '#ede7f6', primary: '#7e57c2' },
    { name: 'Night', bg: '#23272f', primary: '#90caf9' }
];

const CONFIRM_SOUND = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3';
const MILESTONE_SOUND = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3'; // Use a different sound if desired

const themeObj = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#43a047' },
    background: { default: '#f9fafb', paper: '#fff' },
    error: { main: '#e53935' },
    text: { primary: '#222b45' }
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 400 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px 0 rgba(60,72,88,0.08)',
          borderRadius: 16,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
        }
      }
    }
  }
});

const App = () => {
    const [takenLog, setTakenLog] = useState({});
    const sevenDays = getLast7Days();
    const todayId = sevenDays[0].id;
    const [prevStreak, setPrevStreak] = useState(0);
    const { streak } = calculateAnalytics(takenLog);
    const badge = getStreakBadge(streak);
    const monthProgress = getCurrentMonthProgress(takenLog);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [themeIdx, setThemeIdx] = useState(() => {
        const saved = localStorage.getItem('themeIdx');
        return saved ? Number(saved) : 0;
    });
    const theme = THEMES[themeIdx];
    const handleThemeChange = (e) => {
        setThemeIdx(e.target.value);
        localStorage.setItem('themeIdx', e.target.value);
    };
    const pet = getPetForStreak(streak);
    const achievementRef = React.useRef();
    const [muted, setMuted] = useState(() => localStorage.getItem('muted') === 'true');
    const [playConfirm] = useSound(CONFIRM_SOUND, { soundEnabled: !muted, volume: 0.5 });
    const [playMilestone] = useSound(MILESTONE_SOUND, { soundEnabled: !muted, volume: 0.7 });

    useEffect(() => {
        if (streak > prevStreak && STREAK_MILESTONES.includes(streak)) {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                zIndex: 9999
            });
            playMilestone();
        }
        setPrevStreak(streak);
    }, [streak]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "dailyLog"), (snapshot) => {
            const newLog = {};
            snapshot.docs.forEach(doc => {
                newLog[doc.id] = { takenAt: doc.data().takenAt };
            });
            setTakenLog(newLog);
        });
        return () => unsubscribe();
    }, []);

    // --- Notification Scheduling Logic ---
    useEffect(() => {
        let intervalId;
        function checkAndNotify() {
            const reminderEnabled = localStorage.getItem('reminderEnabled') === 'true';
            const reminderTime = localStorage.getItem('reminderTime') || '08:00';
            const notifPermission = Notification?.permission;
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayId = `${year}-${month}-${day}`;
            const takenLog = JSON.parse(localStorage.getItem('takenLog') || '{}');
            const isTaken = takenLog[todayId];
            const notifiedKey = `notified_${todayId}`;
            const alreadyNotified = localStorage.getItem(notifiedKey) === 'true';
            const nowStr = now.toTimeString().slice(0,5);
            if (!reminderEnabled || notifPermission !== 'granted') return;
            if (isTaken) return;
            if (alreadyNotified) return;
            if (nowStr === reminderTime) {
                new Notification('Medicine Reminder', {
                    body: "Don't forget to take your medicine!",
                    icon: '',
                });
                localStorage.setItem(notifiedKey, 'true');
            }
        }
        intervalId = setInterval(checkAndNotify, 60000);
        checkAndNotify();
        return () => clearInterval(intervalId);
    }, []);

    const handleConfirm = async () => {
        const todayDocRef = doc(db, "dailyLog", todayId);
        await setDoc(todayDocRef, { takenAt: new Date() });
        // Show motivational message
        const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
        setSnackbarMsg(msg);
        setSnackbarOpen(true);
        playConfirm();
    };
    const handleUndo = async (dateId) => {
        const docRef = doc(db, "dailyLog", dateId);
        await deleteDoc(docRef);
    };

    const handleShareAchievement = async () => {
        if (!achievementRef.current) return;
        const canvas = await html2canvas(achievementRef.current, { backgroundColor: theme.bg });
        canvas.toBlob(blob => {
            if (blob) saveAs(blob, 'medicine-achievement.png');
        });
    };

    const handleMuteToggle = () => {
        setMuted(m => {
            localStorage.setItem('muted', !m);
            return !m;
        });
    };

    return (
        <ThemeProvider theme={themeObj}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/" element={
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Box sx={{ minHeight: '100vh', pb: 4, background: 'linear-gradient(120deg, #e3f0ff 0%, #f9fafb 60%)' }}>
                                <Container maxWidth="sm">
                                    <Box textAlign="center" mb={4} ref={achievementRef}>
                                        <Typography variant="h3" color="primary" fontWeight={700} gutterBottom>
                                            Daily Medicine Log
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Just one pill, every day.
                                        </Typography>
                                        <Box mt={2} mb={2}>
                                            <Select value={themeIdx} onChange={handleThemeChange} size="small">
                                                {THEMES.map((t, i) => (
                                                    <MenuItem value={i} key={t.name}>{t.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </Box>
                                        {badge && (
                                            <Box mt={2} display="flex" alignItems="center" justifyContent="center">
                                                {badge.icon}
                                                <Typography variant="h6" fontWeight={700} color="secondary.main">{badge.label}</Typography>
                                            </Box>
                                        )}
                                        <Box mt={2} mb={2}>
                                            <Typography fontSize={48} component="span" role="img" aria-label={pet.label}>{pet.emoji}</Typography>
                                            <Typography variant="subtitle2" color="text.secondary">{pet.label}</Typography>
                                        </Box>
                                        <Box mt={3} mb={2}>
                                            <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                                Monthly Progress: {monthProgress.taken}/{monthProgress.daysInMonth} days
                                            </Typography>
                                            <LinearProgress variant="determinate" value={monthProgress.percent} sx={{ height: 12, borderRadius: 6 }} />
                                            <Typography variant="body2" color="text.secondary" mt={1}>{monthProgress.percent}%</Typography>
                                        </Box>
                                    </Box>
                                    <Box textAlign="center" mb={2}>
                                        <IconButton color="primary" onClick={handleShareAchievement} aria-label="Share achievement">
                                            <ShareIcon />
                                        </IconButton>
                                        <IconButton color={muted ? 'default' : 'primary'} onClick={handleMuteToggle} aria-label="Mute/unmute sound">
                                            {muted ? '🔇' : '🔊'}
                                        </IconButton>
                                        <Typography variant="caption" color="text.secondary">Download achievement card &nbsp;|&nbsp; Sound</Typography>
                                    </Box>
                                    <ReminderSettings />
                                    <Paper {...cardPaperProps} sx={{ ...cardPaperProps.sx, mb: 0, mt: 4, p: 2, boxShadow: 1 }}>
                                        {sevenDays.map(({ date, id }) => {
                                            const isTaken = takenLog[id] && takenLog[id].takenAt;
                                            const isToday = id === todayId;
                                            const notifiedKey = `notified_${id}`;
                                            const wasNotified = localStorage.getItem(notifiedKey) === 'true';
                                            const isMissed = wasNotified && !isTaken;
                                            return (
                                                <Grid container key={id} alignItems="center" justifyContent="space-between" py={2} borderBottom={id !== sevenDays[6].id ? 1 : 0} borderColor="#ecf0f1">
                                                    <Grid item xs={6}>
                                                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                                                        {isTaken ? (
                                                            <>
                                                                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                                                <Typography color="success.main" fontWeight={600}>Taken</Typography>
                                                                <Button onClick={() => handleUndo(id)} variant="outlined" color="error" size="small" startIcon={<UndoIcon />}>Undo</Button>
                                                            </>
                                                        ) : (
                                                            isToday ? (
                                                                <Button onClick={handleConfirm} variant="contained" color="primary" size="medium">
                                                                    Confirm Intake
                                                                </Button>
                                                            ) : (
                                                                isMissed ? (
                                                                    <Typography color="error" fontStyle="italic" fontWeight={600}>Missed</Typography>
                                                                ) : (
                                                                    <Typography color="text.disabled" fontStyle="italic">- Missed</Typography>
                                                                )
                                                            )
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            );
                                        })}
                                    </Paper>
                                    <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                                        <MuiAlert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                                            {snackbarMsg}
                                        </MuiAlert>
                                    </Snackbar>
                                </Container>
                            </Box>
                        </LocalizationProvider>
                    } />
                    <Route path="/history" element={<HistoryPage takenLog={takenLog} />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
