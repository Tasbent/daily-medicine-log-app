export const getLast7Days = () => {
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

export const calculateAnalytics = (takenLog) => {
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

export function getCurrentMonthProgress(takenLog) {
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
