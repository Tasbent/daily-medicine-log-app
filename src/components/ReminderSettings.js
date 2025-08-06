import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

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

export default ReminderSettings;
