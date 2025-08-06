import React, { useState, useEffect } from 'react';
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
import ReminderSettings from './components/ReminderSettings';
import HistoryPage from './components/HistoryPage';
import { getLast7Days, calculateAnalytics, getCurrentMonthProgress } from './utils/helpers';
import { getStreakBadge, getPetForStreak } from './utils/streaks';
import { STREAK_MILESTONES, MOTIVATIONAL_MESSAGES, THEMES, CONFIRM_SOUND, MILESTONE_SOUND } from './constants/app';
import { cardPaperProps } from './constants/ui';
import { themeObj } from './styles/theme';

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
                    <Route path="/history" element={<HistoryPage takenLog={takenLog} calculateAnalytics={calculateAnalytics} getStreakBadge={getStreakBadge} cardPaperProps={cardPaperProps} />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;
