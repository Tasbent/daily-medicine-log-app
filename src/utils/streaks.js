import React from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';

export const getStreakBadge = (streak) => {
    if (streak >= 30) {
        return { icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 40, mr: 1 }} />, label: '30 Day Streak!' };
    } else if (streak >= 7) {
        return { icon: <StarIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />, label: '7 Day Streak!' };
    } else if (streak >= 3) {
        return { icon: <StarIcon color="success" sx={{ fontSize: 32, mr: 1 }} />, label: '3 Day Streak!' };
    }
    return null;
};

export const getPetForStreak = (streak) => {
    if (streak >= 30) return { emoji: '🌳', label: 'Mighty Tree' };
    if (streak >= 7) return { emoji: '🌱', label: 'Sprouting Plant' };
    if (streak >= 3) return { emoji: '🌵', label: 'Cactus Buddy' };
    return { emoji: '🌰', label: 'Seedling' };
};
